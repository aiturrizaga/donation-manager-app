import { ChangeDetectionStrategy, Component, computed, inject, numberAttribute, signal } from '@angular/core';
import { input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { DonationsListFacade } from '../../facade/donations-list.facade';
import { DonationFilters } from '../../components/donation-filters/donation-filters';
import { DonationDataView } from '../../components/donation-data-view/donation-data-view';
import { SelectedOrganizationsFilterContext } from '@shared/context/selected-organizations-filter.context';
import { OrganizationMultiSelector } from '@shared/ui/organization-multi-selector/organization-multi-selector';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { FiltersPanel } from '@shared/ui/filters-panel/filters-panel';

const EMPTY_TEXT: Record<'no-records' | 'filtered', { title: string; description: string }> = {
  'no-records': {
    title: 'Aún no hay donaciones',
    description: 'Las donaciones aparecerán aquí a medida que se registren.',
  },
  filtered: {
    title: 'Ninguna donación coincide',
    description: 'Prueba a cambiar los filtros de estado, tipo o fecha.',
  },
};

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Completados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'failed', label: 'Fallidos' },
  { value: 'refunded', label: 'Reembolsados' },
] as const;

type DonationTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-donation-list-page',
  imports: [
    OrganizationMultiSelector,
    DonationFilters,
    FiltersPanel,
    DonationDataView,
    InlineError,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    Button,
    Tooltip,
  ],
  providers: [DonationsListFacade],
  templateUrl: './donation-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationListPage {
  readonly status = input<DonationTabValue>('all');
  readonly donationType = input<string | null>(null);
  readonly dateFrom = input<string | null>(null);
  readonly dateTo = input<string | null>(null);
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly facade = inject(DonationsListFacade);
  protected readonly orgContext = inject(SelectedOrganizationsFilterContext);
  readonly #router = inject(Router);
  readonly #fileDownload = inject(FileDownloadService);

  readonly statusTabs = STATUS_TABS;
  readonly exporting = signal(false);

  protected readonly filtersRef = viewChild(DonationFilters);

  // El router deja `status()` en `undefined` (no en su valor por defecto)
  // cuando la URL no trae `?status=...` — este signal normaliza ambos casos.
  protected readonly activeStatus = computed<DonationTabValue>(() => this.status() ?? 'all');

  protected readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.orgContext.selectedIds().length > 0) count++;
    if (this.donationType()) count++;
    if (this.dateFrom()) count++;
    if (this.dateTo()) count++;
    return count;
  });

  protected readonly emptyText = computed(() => {
    const reason = this.facade.emptyReason();
    return reason ? EMPTY_TEXT[reason] : null;
  });

  constructor() {
    this.facade.connect(() => ({
      organizationIds: this.orgContext.selectedIds(),
      status: this.activeStatus() === 'all' ? null : this.activeStatus(),
      donationType: this.donationType(),
      dateFrom: this.dateFrom(),
      dateTo: this.dateTo(),
      page: this.page(),
      size: 50,
    }));
  }

  onStatusChange(tab: string | number | undefined): void {
    this.#navigate({ status: (tab as DonationTabValue) ?? 'all', page: 1 });
  }

  onFiltersChange(filters: {
    status: string | null;
    donationType: string | null;
    dateFrom: string | null;
    dateTo: string | null;
  }): void {
    this.#navigate({ ...filters, page: 1 });
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.#navigate({ page });
  }

  onClearFilters(): void {
    this.orgContext.select(null);
    this.filtersRef()?.reset();
  }

  onExport(): void {
    this.exporting.set(true);
    this.facade
      .exportCsv()
      .pipe(finalize(() => this.exporting.set(false)))
      .subscribe((blob) => {
        this.#fileDownload.download(blob, `donaciones_${new Date().toISOString().slice(0, 10)}.csv`);
      });
  }

  #navigate(queryParams: Record<string, unknown>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
