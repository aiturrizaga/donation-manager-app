import { Component, input, output } from '@angular/core';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';
import { Organization } from '../../models/organization.model';
import { Paginator, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-organization-data-view',
  imports: [TableModule, Tag, Button, Tooltip, Skeleton, Paginator, EmptyState],
  templateUrl: './organization-data-view.html',
})
export class OrganizationDataView {
  readonly items = input.required<Organization[]>();
  readonly isLoading = input<boolean>(false);
  readonly total = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly delete = output<Organization>();
  readonly pageChange = output<{ first: number; rows: number }>();

  readonly skeletonRows = Array(5).fill({});

  onPageChange(event: TablePageEvent | PaginatorState): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }
}
