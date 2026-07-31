import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { EmptyState } from '@shared/components';
import { RecurringSubscriptionApi } from '@shared/api/recurring-subscription.api';
import { RecurringSubscription } from '@domain/recurring-subscription';

@Component({
  selector: 'app-donor-profile-subscriptions',
  imports: [DecimalPipe, DatePipe, TableModule, Tag, Tooltip, EmptyState],
  templateUrl: './donor-profile-subscriptions.html',
})
export class DonorProfileSubscriptions implements OnInit {
  readonly donorId = input.required<string>();
  readonly #api = inject(RecurringSubscriptionApi);

  readonly items = signal<RecurringSubscription[]>([]);
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
    this.#api.getAll({ page, size: rows }, { donorId: this.donorId() }).subscribe({
      next: (data) => {
        this.items.set(data.items);
        this.total.set(data.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Fixed-term pledges (3/6/9 meses) are stored as frequency="monthly" with
  // totalCycles set — see ChargeDonationUseCase.frequency_to_plan (backend).
  // Without totalCycles this always read as "Anual" (the old fallback),
  // even for a plain "Mensual" subscription, since only 'monthly' itself
  // was ever checked.
  getFrequencyLabel(sub: RecurringSubscription): string {
    if (sub.frequency === 'annual') return 'Anual';
    if (sub.totalCycles) return `Por ${sub.totalCycles} meses`;
    return 'Mensual';
  }

  // A subscription that reached its pledge's total_cycles auto-cancels
  // itself (system-driven, ProcessWebhookUseCase._advance_subscription_cycle)
  // — that's a natural completion, not a cancellation, so it reads
  // differently from one a donor/admin cut short on purpose.
  isFinished(sub: RecurringSubscription): boolean {
    return (
      sub.status === 'cancelled' &&
      sub.cancelledBy === 'system' &&
      sub.totalCycles !== null &&
      sub.completedCycles >= sub.totalCycles
    );
  }

  getStatusSeverity(sub: RecurringSubscription): 'success' | 'warn' | 'danger' | 'secondary' | 'info' {
    if (sub.status === 'cancelled') return this.isFinished(sub) ? 'info' : 'secondary';
    const map: Record<string, 'success' | 'warn' | 'danger'> = {
      active: 'success',
      paused: 'warn',
      past_due: 'danger',
    };
    return map[sub.status] ?? 'secondary';
  }

  getStatusLabel(sub: RecurringSubscription): string {
    if (sub.status === 'cancelled') return this.isFinished(sub) ? 'Finalizada' : 'Cancelada';
    const map: Record<string, string> = {
      active: 'Activa',
      paused: 'Pausada',
      past_due: 'Vencida',
    };
    return map[sub.status] ?? sub.status;
  }
}
