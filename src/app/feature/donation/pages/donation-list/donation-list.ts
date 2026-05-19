import { Component, inject, OnInit, signal } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { Button } from 'primeng/button';
import { DonationStore } from '../../store/donation.store';
import { DonationFilters } from '../../components/donation-filters/donation-filters';
import { DonationDataView } from '../../components/donation-data-view/donation-data-view';
import { DonationFilterParams } from '../../models/donation.model';
import { OrganizationApi } from '../../../organization/api/organization.api';
import { Organization } from '../../../organization/models/organization.model';

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
  imports: [DonationFilters, DonationDataView, Tabs, TabList, Tab, Badge, Chip, Button],
  providers: [DonationStore],
  templateUrl: './donation-list.html',
})
export class DonationListPage implements OnInit {
  readonly store = inject(DonationStore);
  readonly #orgApi = inject(OrganizationApi);

  readonly statusTabs = STATUS_TABS;
  activeStatus: DonationTabValue = 'all';

  readonly organizations = signal<Organization[]>([]);

  ngOnInit(): void {
    this.store.load();
    this._loadOrganizations();
  }

  private _loadOrganizations(): void {
    this.#orgApi
      .getAll({ page: 1, size: 100 }, {})
      .subscribe((data) =>
        this.organizations.set(
          data.items.map((o) => ({ ...o, tradeName: o.tradeName ?? o.legalName })),
        ),
      );
  }

  onStatusChange(tab: string | number | undefined): void {
    this.activeStatus = (tab as DonationTabValue) ?? 'all';
    const status = tab === 'all' ? null : (tab as string);
    this.store.setFilters({ ...this.store.filters(), status });
    this.store.load();
  }

  onFiltersChange(filters: DonationFilterParams): void {
    const status = this.activeStatus === 'all' ? null : this.activeStatus;
    this.store.setFilters({ ...filters, status });
    this.store.load();
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.store.changePage(page, event.rows);
    this.store.load();
  }

  onExport(): void {
    this.store.exportCsv();
  }
}
