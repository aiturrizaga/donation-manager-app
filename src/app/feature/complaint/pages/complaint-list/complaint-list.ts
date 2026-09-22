import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { ComplaintsListFacade } from '../../facade/complaints-list.facade';
import { ComplaintFilters } from '../../components/complaint-filters/complaint-filters';
import { ComplaintDataView } from '../../components/complaint-data-view/complaint-data-view';
import { SaveComplaintDlg } from '../../components/save-complaint-dlg/save-complaint-dlg';
import { ComplaintApi } from '@shared/api/complaint.api';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';
import { SelectedOrganizationsFilterContext } from '@shared/context/selected-organizations-filter.context';
import { OrganizationMultiSelector } from '@shared/ui/organization-multi-selector/organization-multi-selector';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { FiltersPanel } from '@shared/ui/filters-panel/filters-panel';

const EMPTY_TEXT: Record<'no-records' | 'filtered' | 'search', { title: string; description: string }> = {
  'no-records': {
    title: 'Aún no hay reclamos',
    description: 'Los reclamos ingresados por el portal aparecerán aquí.',
  },
  filtered: {
    title: 'Ningún reclamo coincide',
    description: 'Prueba a cambiar los filtros.',
  },
  search: {
    title: 'Sin resultados',
    description: 'Ningún reclamo coincide con tu búsqueda.',
  },
};

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'resolved', label: 'Resueltos' },
  { value: 'closed', label: 'Cerrados' },
  // Bandeja ortogonal al estado — reclamos sin organización resuelta por
  // dominio (ej. dominio mal configurado). Ver ComplaintsListFacade.connect.
  { value: 'unassigned', label: 'Sin organización' },
] as const;

type ComplaintTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-complaint-list',
  imports: [
    OrganizationMultiSelector,
    ComplaintFilters,
    FiltersPanel,
    ComplaintDataView,
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
  providers: [ComplaintsListFacade, DialogService],
  templateUrl: './complaint-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintListPage {
  readonly search = input<string | null>(null);
  readonly recordType = input<string | null>(null);
  readonly status = input<ComplaintTabValue>('all');
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly facade = inject(ComplaintsListFacade);
  protected readonly orgContext = inject(SelectedOrganizationsFilterContext);
  readonly #dialog = inject(DialogService);
  readonly #router = inject(Router);
  readonly #organizationsCatalog = inject(OrganizationsCatalog);
  readonly #complaintApi = inject(ComplaintApi);

  readonly statusTabs = STATUS_TABS;

  // El router deja `status()` en `undefined` (no en su valor por defecto)
  // cuando la URL no trae `?status=...` — este signal normaliza ambos casos.
  protected readonly activeStatus = computed<ComplaintTabValue>(() => this.status() ?? 'all');

  protected readonly isUnassignedTab = computed(() => this.activeStatus() === 'unassigned');

  // Badge fijo del tab "Sin organización" — independiente del tab activo,
  // para que se note incluso si el usuario está viendo otro estado.
  protected readonly unassignedCount = toSignal(this.#complaintApi.getUnassignedCount(), {
    initialValue: 0,
  });

  readonly organizations = this.#organizationsCatalog.items;

  protected readonly emptyText = computed(() => {
    const reason = this.facade.emptyReason();
    return reason ? EMPTY_TEXT[reason] : null;
  });

  protected readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.orgContext.selectedIds().length > 0) count++;
    if (this.search()) count++;
    if (this.recordType()) count++;
    return count;
  });

  constructor() {
    this.facade.connect(() => ({
      organizationIds: this.orgContext.selectedIds(),
      search: this.search(),
      recordType: this.recordType(),
      unassigned: this.isUnassignedTab(),
      status: this.isUnassignedTab() || this.activeStatus() === 'all' ? null : this.activeStatus(),
      page: this.page(),
      size: 50,
    }));
  }

  onStatusChange(tab: string | number | undefined): void {
    this.#navigate({ status: (tab as ComplaintTabValue) ?? 'all', page: 1 });
  }

  onFiltersChange(filters: { search: string | null; recordType: string | null }): void {
    this.#navigate({ search: filters.search, recordType: filters.recordType, page: 1 });
  }

  onClearFilters(): void {
    this.orgContext.select(null);
    this.#navigate({ search: null, recordType: null, page: 1 });
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.#navigate({ page });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveComplaintDlg, {
      header: 'Nuevo reclamo',
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
