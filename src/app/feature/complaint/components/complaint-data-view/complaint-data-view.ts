import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Skeleton } from 'primeng/skeleton';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { EmptyState } from '@shared/components';
import { Complaint } from '@domain/complaint';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

const STATUS_SEVERITIES: Record<string, 'success' | 'warn' | 'danger' | 'secondary' | 'info'> = {
  pending: 'warn',
  in_review: 'info',
  resolved: 'success',
  closed: 'secondary',
};

@Component({
  selector: 'app-complaint-data-view',
  imports: [DatePipe, RouterLink, TableModule, Tag, Button, Tooltip, Skeleton, Paginator, EmptyState],
  templateUrl: './complaint-data-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintDataView {
  readonly items = input.required<Complaint[]>();
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
    return STATUS_LABELS[status] ?? status;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' | 'info' {
    return STATUS_SEVERITIES[status] ?? 'secondary';
  }

  getRecordTypeLabel(recordType: string): string {
    return recordType === 'reclamo' ? 'Reclamo' : 'Queja';
  }

  onPageChange(event: TablePageEvent | PaginatorState): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }
}
