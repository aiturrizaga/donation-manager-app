import { ChangeDetectionStrategy, Component, computed, inject, numberAttribute } from '@angular/core';
import { input } from '@angular/core';
import { Router } from '@angular/router';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DonationPagesListFacade } from '../../facade/donation-pages-list.facade';
import { DonationPageFilters } from '../../components/donation-page-filters/donation-page-filters';
import { DonationPageDataView } from '../../components/donation-page-data-view/donation-page-data-view';
import { DonationPageSummary } from '@domain/donation-page';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';
import { SelectedOrganizationsFilterContext } from '@shared/context/selected-organizations-filter.context';
import { OrganizationMultiSelector } from '@shared/ui/organization-multi-selector/organization-multi-selector';
import { CreateDonationPageDlg } from '../../components/create-donation-page-dlg/create-donation-page-dlg';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { rowOperation } from '@shared/utils/row-operation';

const EMPTY_TEXT: Record<'no-records' | 'filtered' | 'search', { title: string; description: string }> = {
  'no-records': {
    title: 'Aún no hay páginas',
    description: 'Crea una nueva página de donación para esta organización.',
  },
  filtered: {
    title: 'Ninguna página coincide',
    description: 'Prueba a cambiar el filtro de estado.',
  },
  search: {
    title: 'Sin resultados',
    description: 'Ninguna página coincide con tu búsqueda.',
  },
};

const STATUS_TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
] as const;

type PageTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-donation-page-list',
  imports: [
    OrganizationMultiSelector,
    DonationPageFilters,
    DonationPageDataView,
    InlineError,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [DonationPagesListFacade, DialogService],
  templateUrl: './donation-page-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationPageListPage {
  readonly search = input<string | null>(null);
  readonly status = input<PageTabValue>('all');
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly facade = inject(DonationPagesListFacade);
  protected readonly orgContext = inject(SelectedOrganizationsFilterContext);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);
  readonly #dialog = inject(DialogService);
  readonly #router = inject(Router);
  readonly #organizationsCatalog = inject(OrganizationsCatalog);

  readonly statusTabs = STATUS_TABS;

  // El router deja `status()` en `undefined` (no en su valor por defecto)
  // cuando la URL no trae `?status=...` — este signal normaliza ambos casos.
  protected readonly activeStatus = computed<PageTabValue>(() => this.status() ?? 'all');

  protected readonly toggleOp = rowOperation<string>();
  protected readonly deleteOp = rowOperation<string>();

  // Usado solo por el diálogo de creación (necesita TODAS las organizaciones,
  // no la seleccionada globalmente) — reexportado directo, sin computed extra.
  readonly organizations = this.#organizationsCatalog.items;

  protected readonly emptyText = computed(() => {
    const reason = this.facade.emptyReason();
    return reason ? EMPTY_TEXT[reason] : null;
  });

  constructor() {
    this.facade.connect(() => ({
      organizationIds: this.orgContext.selectedIds(),
      search: this.search(),
      isActive: this.activeStatus() === 'active' ? true : this.activeStatus() === 'inactive' ? false : null,
      page: this.page(),
      size: 50,
    }));
  }

  onStatusChange(tab: string | number | undefined): void {
    this.#navigate({ status: (tab as PageTabValue) ?? 'all', page: 1 });
  }

  onFiltersChange(filters: { search: string | null }): void {
    this.#navigate({ search: filters.search, page: 1 });
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.#navigate({ page });
  }

  onToggleActive(page: DonationPageSummary): void {
    if (this.toggleOp.isActive(page.id)) return;
    const deactivating = page.isActive;
    this.#confirm.confirm({
      message: `¿Deseas ${deactivating ? 'desactivar' : 'activar'} "${page.name}"?`,
      header: deactivating ? 'Desactivar página' : 'Activar página',
      icon: deactivating ? 'ti ti-eye-off' : 'ti ti-eye',
      rejectLabel: 'No',
      acceptLabel: deactivating ? 'Sí, desactivar' : 'Sí, activar',
      acceptButtonProps: deactivating ? { severity: 'danger' } : {},
      accept: () => {
        this.toggleOp.run(page.id, this.facade.toggleActive(page)).subscribe({
          next: () => this.facade.reload(),
          error: () => this.#notifyError(`No se pudo ${deactivating ? 'desactivar' : 'activar'} la página.`),
        });
      },
    });
  }

  onDelete(page: DonationPageSummary): void {
    if (this.deleteOp.isActive(page.id)) return;
    this.#confirm.confirm({
      message: `¿Eliminar "${page.name}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar página',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.deleteOp.run(page.id, this.facade.remove(page.id)).subscribe({
          next: () => this.facade.reload(),
          error: () => this.#notifyError('No se pudo eliminar la página.'),
        });
      },
    });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(CreateDonationPageDlg, {
      header: 'Nueva página de donación',
      width: '540px',
      modal: true,
      closable: true,
      data: { organizations: this.organizations() },
    });

    ref?.onClose.subscribe((result) => {
      if (result) this.facade.reload();
    });
  }

  #navigate(queryParams: Record<string, unknown>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
