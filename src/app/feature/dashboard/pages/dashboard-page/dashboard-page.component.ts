import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { RecentDonationsComponent } from '../../components/recent-donations/recent-donations.component';
import { DonorsSummaryComponent } from '../../components/donors-summary/donors-summary.component';

import {
  DashboardFilters,
  OrganizationOption,
  RecentDonation,
} from '../../models/dashboard.models';
import {
  MOCK_DONORS_BY_MONTH,
  MOCK_ORGANIZATIONS,
  MOCK_RECENT_DONATIONS,
  MOCK_STATS,
} from '../../models/dashboard.mock';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    StatsCardComponent,
    RecentDonationsComponent,
    DonorsSummaryComponent,
    Select,
    DatePicker,
  ],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  // ------- Filter state -------
  organizations: OrganizationOption[] = [
    { id: '', name: 'Todas las organizaciones' },
    ...MOCK_ORGANIZATIONS,
  ];

  filters = signal<DashboardFilters>({
    organizationId: null,
    dateFrom: startOfMonth(new Date()),
    dateTo: endOfMonth(new Date()),
  });

  selectedOrgId: string | null = null;
  dateFrom: Date = startOfMonth(new Date());
  dateTo: Date = endOfMonth(new Date());

  // ------- Data (mock) -------
  stats = MOCK_STATS;
  donorsByMonth = MOCK_DONORS_BY_MONTH;

  filteredDonations = computed<RecentDonation[]>(() => {
    const { organizationId, dateFrom, dateTo } = this.filters();
    return MOCK_RECENT_DONATIONS.filter((d) => {
      const inDateRange = d.createdAt >= dateFrom && d.createdAt <= dateTo;
      // In a real integration, filter by organizationId via the API call
      return inDateRange;
    });
  });

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filters.set({
      organizationId: this.selectedOrgId || null,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
    });
  }

  resetFilters(): void {
    this.selectedOrgId = null;
    this.dateFrom = startOfMonth(new Date());
    this.dateTo = endOfMonth(new Date());
    this.applyFilters();
  }
}
