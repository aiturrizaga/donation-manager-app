import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-organization-table',
  imports: [TableModule, Tag, Button, Tooltip, Skeleton, EmptyState],
  templateUrl: './organization-table.html',
})
export class OrganizationTable {
  readonly items = input.required<Organization[]>();
  readonly isLoading = input<boolean>(false);
  readonly total = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);

  readonly toggleActive = output<Organization>();
  readonly delete = output<Organization>();
  readonly pageChange = output<{ first: number; rows: number }>();

  readonly skeletonRows = Array(5).fill({});
}
