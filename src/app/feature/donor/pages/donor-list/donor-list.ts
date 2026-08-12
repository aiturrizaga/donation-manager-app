import { ChangeDetectionStrategy, Component, computed, inject, numberAttribute, signal } from '@angular/core';
import { input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DonorsListFacade } from '../../facade/donors-list.facade';
import { DonorFilters } from '../../components/donor-filters/donor-filters';
import { DonorDataView } from '../../components/donor-data-view/donor-data-view';
import { DonorPreviewDrawer } from '../../components/donor-preview-drawer/donor-preview-drawer';
import { SaveDonorDlg } from '../../components/save-donor-dlg/save-donor-dlg';
import { Donor } from '@domain/donor';
import { SelectedOrganizationsFilterContext } from '@shared/context/selected-organizations-filter.context';
import { OrganizationMultiSelector } from '@shared/ui/organization-multi-selector/organization-multi-selector';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { rowOperation } from '@shared/utils/row-operation';

const EMPTY_TEXT: Record<'no-records' | 'filtered' | 'search', { title: string; description: string }> = {
  'no-records': {
    title: 'Aún no hay donantes',
    description: 'Los donantes aparecerán aquí a medida que se registren o se creen manualmente.',
  },
  filtered: {
    title: 'Ningún donante coincide',
    description: 'Prueba a cambiar el filtro de estado.',
  },
  search: {
    title: 'Sin resultados',
    description: 'Ningún donante coincide con tu búsqueda.',
  },
};

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
] as const;

type DonorTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-donor-list-page',
  imports: [
    OrganizationMultiSelector,
    DonorFilters,
    DonorDataView,
    DonorPreviewDrawer,
    InlineError,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Tooltip,
  ],
  providers: [DonorsListFacade, DialogService],
  templateUrl: './donor-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonorListPage {
  readonly search = input<string | null>(null);
  readonly status = input<DonorTabValue>('all');
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly facade = inject(DonorsListFacade);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);
  readonly #dialog = inject(DialogService);
  readonly #router = inject(Router);
  readonly #orgContext = inject(SelectedOrganizationsFilterContext);

  readonly statusTabs = STATUS_TABS;

  // El router deja `status()` en `undefined` (no en su valor por defecto)
  // cuando la URL no trae `?status=...` — este signal normaliza ambos casos.
  protected readonly activeStatus = computed<DonorTabValue>(() => this.status() ?? 'all');

  protected readonly toggleOp = rowOperation<string>();
  protected readonly deleteOp = rowOperation<string>();

  readonly previewVisible = signal(false);
  readonly previewDonor = signal<Donor | null>(null);

  protected readonly emptyText = computed(() => {
    const reason = this.facade.emptyReason();
    return reason ? EMPTY_TEXT[reason] : null;
  });

  constructor() {
    this.facade.connect(() => {
      const orgIds = this.#orgContext.selectedIds();
      return {
        organizationIds: orgIds.length ? orgIds : null,
        search: this.search(),
        isActive: this.activeStatus() === 'active' ? true : this.activeStatus() === 'inactive' ? false : null,
        page: this.page(),
        size: 50,
      };
    });
  }

  onStatusChange(tab: string | number | undefined): void {
    this.#navigate({ status: (tab as DonorTabValue) ?? 'all', page: 1 });
  }

  onFiltersChange(filters: { search: string | null }): void {
    this.#navigate({ search: filters.search, page: 1 });
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.#navigate({ page });
  }

  onToggleActive(donor: Donor): void {
    if (this.toggleOp.isActive(donor.id)) return;
    const deactivating = donor.isActive;
    this.#confirm.confirm({
      message: `¿Deseas ${deactivating ? 'desactivar' : 'activar'} a ${donor.partner.name}?`,
      header: deactivating ? 'Desactivar donante' : 'Activar donante',
      icon: deactivating ? 'ti ti-user-off' : 'ti ti-user-check',
      rejectLabel: 'No',
      acceptLabel: deactivating ? 'Sí, desactivar' : 'Sí, activar',
      acceptButtonProps: deactivating ? { severity: 'danger' } : {},
      accept: () => {
        this.toggleOp.run(donor.id, this.facade.toggleActive(donor)).subscribe({
          next: () => {
            this.facade.reload();
            this.#notifySuccess(deactivating ? 'Donante desactivado.' : 'Donante activado.');
          },
          error: () => this.#notifyError(`No se pudo ${deactivating ? 'desactivar' : 'activar'} al donante.`),
        });
      },
    });
  }

  onPreview(donor: Donor): void {
    this.previewDonor.set(donor);
    this.previewVisible.set(true);
  }

  onDelete(donor: Donor): void {
    if (this.deleteOp.isActive(donor.id)) return;
    this.#confirm.confirm({
      message: `¿Eliminar a ${donor.partner.name}? Esta acción no se puede deshacer.`,
      header: 'Eliminar donante',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.deleteOp.run(donor.id, this.facade.remove(donor.id)).subscribe({
          next: () => this.facade.reload(),
          error: () => this.#notifyError('No se pudo eliminar al donante.'),
        });
      },
    });
  }

  #notifySuccess(detail: string): void {
    this.#message.add({ severity: 'success', summary: 'Listo', detail });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveDonorDlg, {
      header: 'Nuevo donante',
      width: '560px',
      modal: true,
      closable: true,
    });
    ref?.onClose.subscribe((result: Donor) => {
      if (result) this.facade.reload();
    });
  }

  openEditDialog(donor: Donor): void {
    const ref = this.#dialog.open(SaveDonorDlg, {
      header: 'Editar donante',
      width: '560px',
      modal: true,
      closable: true,
      data: { donor },
    });
    ref?.onClose.subscribe((result) => {
      if (result) this.facade.reload();
    });
  }

  #navigate(queryParams: Record<string, unknown>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
