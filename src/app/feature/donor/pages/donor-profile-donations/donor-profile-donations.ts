import { Component, input, OnInit, signal } from '@angular/core';
import { inject } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { EmptyState } from '@shared/components';
import { DonationApi } from '../../../donation/api/donation.api';

@Component({
  selector: 'app-donor-profile-donations',
  imports: [DecimalPipe, DatePipe, TableModule, Tag, EmptyState],
  templateUrl: './donor-profile-donations.html',
})
export class DonorProfileDonations implements OnInit {
  readonly donorId = input.required<string>();
  readonly #donationApi = inject(DonationApi);

  readonly items = signal<any[]>([]);
  readonly loading = signal(true);
  readonly total = signal(0);

  ngOnInit(): void {
    this.#donationApi.getAll({ page: 1, size: 50 }, { donorId: this.donorId() }).subscribe({
      next: (data) => {
        this.items.set(data.items);
        this.total.set(data.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      completed: 'Completado',
      pending: 'Pendiente',
      failed: 'Fallido',
      refunded: 'Reembolsado',
      expired: 'Expirado',
    };
    return map[status] ?? status;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      completed: 'success',
      pending: 'warn',
      failed: 'danger',
      refunded: 'secondary',
      expired: 'secondary',
    };
    return map[status] ?? 'secondary';
  }
}
