import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';
import { DonationApi } from '@shared/api/donation.api';
import { WebhookEvent } from '@domain/donation';

@Component({
  selector: 'app-donation-detail-webhooks',
  imports: [DatePipe, TableModule, Tag, Skeleton, EmptyState],
  templateUrl: './donation-detail-webhooks.html',
})
export class DonationDetailWebhooks implements OnInit {
  readonly donationId = input.required<string>();
  readonly #api = inject(DonationApi);

  readonly items = signal<WebhookEvent[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.#api.getWebhookEvents(this.donationId()).subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    if (status === 'processed') return 'success';
    if (status === 'failed') return 'danger';
    return 'warn';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      received: 'Recibido',
      processed: 'Procesado',
      failed: 'Fallido',
    };
    return map[status] ?? status;
  }
}
