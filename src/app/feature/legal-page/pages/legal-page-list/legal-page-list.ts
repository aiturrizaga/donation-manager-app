import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute } from '@angular/core';
import { Router } from '@angular/router';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { LegalPagesListFacade } from '../../facade/legal-pages-list.facade';
import { LegalPageFilters } from '../../components/legal-page-filters/legal-page-filters';
import { LegalPageDataView } from '../../components/legal-page-data-view/legal-page-data-view';
import { SaveLegalPageDlg } from '../../components/save-legal-page-dlg/save-legal-page-dlg';
import { LegalPageApi } from '@shared/api/legal-page.api';
import { LegalPage } from '@domain/legal-page';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';
import { SelectedOrganizationsFilterContext } from '@shared/context/selected-organizations-filter.context';
import { OrganizationMultiSelector } from '@shared/ui/organization-multi-selector/organization-multi-selector';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { FiltersPanel } from '@shared/ui/filters-panel/filters-panel';
import { rowOperation } from '@shared/utils/row-operation';

const EMPTY_TEXT: Record<'no-records' | 'filtered' | 'search', { title: string; description: string }> = {
  'no-records': {
    title: 'Aún no hay páginas legales',
    description: 'Crea una nueva página legal para esta organización.',
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

type LegalPageTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-legal-page-list',
  imports: [
    OrganizationMultiSelector,
    LegalPageFilters,
    FiltersPanel,
    LegalPageDataView,
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
  providers: [LegalPagesListFacade, DialogService],
  templateUrl: './legal-page-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPageListPage {
  readonly search = input<string | null>(null);
  readonly status = input<LegalPageTabValue>('all');
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly facade = inject(LegalPagesListFacade);
  protected readonly orgContext = inject(SelectedOrganizationsFilterContext);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);
  readonly #dialog = inject(DialogService);
  readonly #router = inject(Router);
  readonly #organizationsCatalog = inject(OrganizationsCatalog);
  readonly #api = inject(LegalPageApi);

  readonly statusTabs = STATUS_TABS;

  // El router deja `status()` en `undefined` (no en su valor por defecto)
  // cuando la URL no trae `?status=...` — este signal normaliza ambos casos.
  protected readonly activeStatus = computed<LegalPageTabValue>(() => this.status() ?? 'all');

  protected readonly deleteOp = rowOperation<number>();

  readonly organizations = this.#organizationsCatalog.items;

  protected readonly emptyText = computed(() => {
    const reason = this.facade.emptyReason();
    return reason ? EMPTY_TEXT[reason] : null;
  });

  protected readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.orgContext.selectedIds().length > 0) count++;
    if (this.search()) count++;
    return count;
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
    this.#navigate({ status: (tab as LegalPageTabValue) ?? 'all', page: 1 });
  }

  onFiltersChange(filters: { search: string | null }): void {
    this.#navigate({ search: filters.search, page: 1 });
  }

  onClearFilters(): void {
    this.orgContext.select(null);
    this.#navigate({ search: null, page: 1 });
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.#navigate({ page });
  }

  onDelete(legalPage: LegalPage): void {
    if (this.deleteOp.isActive(legalPage.id)) return;
    this.#confirm.confirm({
      message: `¿Eliminar "${legalPage.title}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar página legal',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.deleteOp.run(legalPage.id, this.#api.delete(legalPage.id)).subscribe({
          next: () => {
            this.facade.reload();
            this.#message.add({ severity: 'success', summary: 'Listo', detail: 'Página legal eliminada.' });
          },
          error: () => this.#message.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la página legal.' }),
        });
      },
    });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveLegalPageDlg, {
      header: 'Nueva página legal',
      width: '640px',
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
