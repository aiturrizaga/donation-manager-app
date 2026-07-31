import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';

import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { RecentDonationsComponent } from '../../components/recent-donations/recent-donations.component';
import { DonorsSummaryComponent } from '../../components/donors-summary/donors-summary.component';

import { DashboardSummary, DonorsByMonth, RecentDonation } from '../../models/dashboard.models';
import { ApiResponse } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import { SelectedOrganizationsFilterContext } from '@shared/context/selected-organizations-filter.context';
import { OrganizationMultiSelector } from '@shared/ui/organization-multi-selector/organization-multi-selector';
import { environment } from '@env/environment';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const EMPTY_STATS: DashboardSummary['stats'] = {
  totalCollected: 0,
  totalDonations: 0,
  activeDonors: 0,
  avgDonation: 0,
  collectedDelta: 0,
  donationsDelta: 0,
  donorsDelta: 0,
  avgDonationDelta: 0,
};

@Component({
  selector: 'app-dashboard-page',
  imports: [
    FormsModule,
    ButtonModule,
    StatsCardComponent,
    RecentDonationsComponent,
    DonorsSummaryComponent,
    OrganizationMultiSelector,
    DatePicker,
  ],
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly orgContext = inject(SelectedOrganizationsFilterContext);

  readonly dateFrom = signal<Date>(startOfMonth(new Date()));
  readonly dateTo = signal<Date>(endOfMonth(new Date()));

  readonly #summaryResource = httpResource<ApiResponse<DashboardSummary>>(() => ({
    url: `${environment.apiUrl}/v1/dashboard/summary`,
    params: buildHttpParams({
      organizationIds: this.orgContext.selectedIds(),
      dateFrom: toIsoDate(this.dateFrom()),
      dateTo: toIsoDate(this.dateTo()),
    }),
  }));

  readonly loading = this.#summaryResource.isLoading;

  readonly stats = computed<DashboardSummary['stats']>(
    () => this.#summaryResource.value()?.data.stats ?? EMPTY_STATS,
  );

  readonly donorsByMonth = computed<DonorsByMonth[]>(
    () => this.#summaryResource.value()?.data.donorsByMonth ?? [],
  );

  readonly recentDonations = computed<RecentDonation[]>(
    () => this.#summaryResource.value()?.data.recentDonations ?? [],
  );

  resetFilters(): void {
    this.dateFrom.set(startOfMonth(new Date()));
    this.dateTo.set(endOfMonth(new Date()));
    this.orgContext.select([]);
  }
}
