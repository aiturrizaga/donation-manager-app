import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { EmptyState } from '@shared/components';
import { DonationApi } from '@shared/api/donation.api';
import { Donation } from '@domain/donation';
import { getDonationStatusLabel, getDonationStatusSeverity } from '@shared/utils/donation-status.util';

@Component({
  selector: 'app-donor-profile-donations',
  imports: [DecimalPipe, DatePipe, TableModule, Tag, EmptyState],
  templateUrl: './donor-profile-donations.html',
})
export class DonorProfileDonations implements OnInit {
  readonly donorId = input.required<string>();
  readonly #donationApi = inject(DonationApi);

  readonly items = signal<Donation[]>([]);
  readonly loading = signal(true);
  readonly total = signal(0);
  readonly first = signal(0);
  readonly rows = signal(10);

  ngOnInit(): void {
    this.loadPage(0, this.rows());
  }

  onPageChange(event: TablePageEvent): void {
    const rows = event.rows ?? this.rows();
    this.rows.set(rows);
    this.first.set(event.first ?? 0);
    this.loadPage(event.first ?? 0, rows);
  }

  private loadPage(first: number, rows: number): void {
    this.loading.set(true);
    const page = Math.floor(first / rows) + 1;
    this.#donationApi.getAll({ page, size: rows }, { donorId: this.donorId() }).subscribe({
      next: (data) => {
        this.items.set(data.items);
        this.total.set(data.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStatusLabel(status: string): string {
    return getDonationStatusLabel(status);
  }

  getStatusSeverity(status: string) {
    return getDonationStatusSeverity(status);
  }
}
