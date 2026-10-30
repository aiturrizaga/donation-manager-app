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
import { OrganizationLabel } from '@shared/ui/organization-label/organization-label';
import { getTargetTypeLabel } from '@shared/utils/target-type.util';
import { getDonationStatusLabel, getDonationStatusSeverity } from '@shared/utils/donation-status.util';

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
    OrganizationLabel,
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
    return getDonationStatusLabel(status);
  }

  getStatusSeverity(status: string) {
    return getDonationStatusSeverity(status);
  }

  getTargetTypeLabel(type: string): string {
    return getTargetTypeLabel(type);
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
