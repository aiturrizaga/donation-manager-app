import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Tooltip } from 'primeng/tooltip';
import { EmptyState } from '@shared/components';
import { Donation } from '@domain/donation';

@Component({
  selector: 'app-donation-data-view',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    TableModule,
    Tag,
    Button,
    Skeleton,
    Paginator,
    Tooltip,
    EmptyState,
  ],
  templateUrl: './donation-data-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationDataView {
  readonly items = input.required<Donation[]>();
  readonly isLoading = input<boolean>(false);
  readonly total = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly pageChange = output<{ first: number; rows: number }>();

  readonly skeletonRows = Array(5).fill({});

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

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' | 'info' {
    const map: Record<string, any> = {
      completed: 'success',
      pending: 'warn',
      failed: 'danger',
      refunded: 'secondary',
      expired: 'secondary',
    };
    return map[status] ?? 'secondary';
  }

  getTypeLabel(type: string): string {
    return type === 'one_time' ? 'Única' : 'Recurrente';
  }

  onPageChange(event: TablePageEvent | PaginatorState): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }
}
