import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Skeleton } from 'primeng/skeleton';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { EmptyState } from '@shared/components';
import { LegalPage } from '@domain/legal-page';

@Component({
  selector: 'app-legal-page-data-view',
  imports: [RouterLink, TableModule, Tag, Button, Tooltip, Skeleton, Paginator, EmptyState],
  templateUrl: './legal-page-data-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPageDataView {
  readonly items = input.required<LegalPage[]>();
  readonly isLoading = input<boolean>(false);
  readonly total = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly delete = output<LegalPage>();
  readonly pageChange = output<{ first: number; rows: number }>();

  readonly skeletonRows = Array(5).fill({});

  getTypeLabel(page: LegalPage): string {
    if (page.legalType === 'privacy_policy') return 'Política de privacidad';
    if (page.legalType === 'terms_of_service') return 'Términos de uso';
    return 'Personalizada';
  }

  onPageChange(event: TablePageEvent | PaginatorState): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }
}
