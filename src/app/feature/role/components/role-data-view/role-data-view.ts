import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';
import { Role } from '@domain/rbac';

@Component({
  selector: 'app-role-data-view',
  imports: [RouterLink, TableModule, Tag, Button, Tooltip, Skeleton, EmptyState],
  templateUrl: './role-data-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleDataView {
  readonly items = input.required<Role[]>();
  readonly isLoading = input<boolean>(false);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly edit = output<Role>();
  readonly delete = output<Role>();

  readonly skeletonRows = Array(5).fill({});
}
