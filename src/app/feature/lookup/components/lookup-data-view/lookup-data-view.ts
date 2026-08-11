import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';
import { Lookup } from '@domain/lookup';

@Component({
  selector: 'app-lookup-data-view',
  imports: [RouterLink, TableModule, Tag, Button, Tooltip, Skeleton, EmptyState],
  templateUrl: './lookup-data-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookupDataView {
  readonly items = input.required<Lookup[]>();
  readonly isLoading = input<boolean>(false);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly edit = output<Lookup>();
  readonly delete = output<Lookup>();

  readonly skeletonRows = Array(4).fill({});
}
