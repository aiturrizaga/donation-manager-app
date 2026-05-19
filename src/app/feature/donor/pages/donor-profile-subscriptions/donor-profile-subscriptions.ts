import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { EmptyState } from '@shared/components';
import { DonationApi } from '../../../donation/api/donation.api';

@Component({
  selector: 'app-donor-profile-subscriptions',
  imports: [DecimalPipe, DatePipe, TableModule, Tag, EmptyState],
  templateUrl: './donor-profile-subscriptions.html',
})
export class DonorProfileSubscriptions implements OnInit {
  readonly donorId = input.required<string>();
  readonly #api = inject(DonationApi);

  readonly items = signal<any[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.#api.getAll({ page: 1, size: 50 }, { donorId: this.donorId() }).subscribe({
      next: (data) => {
        this.items.set(data.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      active: 'success',
      paused: 'warn',
      cancelled: 'secondary',
    };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Activa',
      paused: 'Pausada',
      cancelled: 'Cancelada',
    };
    return map[status] ?? status;
  }

  getFrequencyLabel(frequency: string): string {
    return frequency === 'monthly' ? 'Mensual' : 'Anual';
  }
}
