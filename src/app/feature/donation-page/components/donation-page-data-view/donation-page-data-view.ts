import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Tooltip } from 'primeng/tooltip';
import { EmptyState } from '@shared/components';
import { DonationPageSummary } from '../../models/donation-page.model';

@Component({
  selector: 'app-donation-page-data-view',
  imports: [
    RouterLink,
    FormsModule,
    TableModule,
    Tag,
    Button,
    Skeleton,
    ToggleSwitch,
    Menu,
    Paginator,
    Tooltip,
    EmptyState,
  ],
  templateUrl: './donation-page-data-view.html',
})
export class DonationPageDataView {
  readonly items = input.required<DonationPageSummary[]>();
  readonly isLoading = input<boolean>(false);
  readonly total = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly toggleActive = output<DonationPageSummary>();
  readonly delete = output<DonationPageSummary>();
  readonly pageChange = output<{ first: number; rows: number }>();

  readonly skeletonRows = Array(5).fill({});
  readonly menu = viewChild.required<Menu>('menu');
  readonly selectedPage = signal<DonationPageSummary | null>(null);

  readonly menuItems = computed((): MenuItem[] => {
    const page = this.selectedPage();
    if (!page) return [];
    return [
      {
        label: 'Eliminar',
        icon: 'ti ti-trash',
        labelClass: 'text-red-500!',
        iconClass: 'text-red-500!',
        styleClass: 'bg-red-50!',
        command: () => this.delete.emit(page),
      },
    ];
  });

  openMenu(event: MouseEvent, page: DonationPageSummary): void {
    this.selectedPage.set(page);
    this.menu().toggle(event);
  }

  getDomainStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      verified: 'success',
      pending: 'warn',
      error: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  onPageChange(event: TablePageEvent | PaginatorState): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }
}
