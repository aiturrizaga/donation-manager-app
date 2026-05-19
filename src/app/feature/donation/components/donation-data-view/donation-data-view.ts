import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { EmptyState } from '@shared/components';
import { Donation } from '../../models/donation.model';

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
    Menu,
    Paginator,
    EmptyState,
  ],
  templateUrl: './donation-data-view.html',
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
  readonly menu = viewChild.required<Menu>('menu');
  readonly selectedDonation = signal<Donation | null>(null);

  readonly menuItems = computed((): MenuItem[] => {
    const donation = this.selectedDonation();
    if (!donation) return [];
    return [
      {
        label: 'Vista previa',
        icon: 'ti ti-eye',
        // TODO: emit preview event when drawer is implemented
        command: () => {},
      },
    ];
  });

  openMenu(event: MouseEvent, donation: Donation): void {
    this.selectedDonation.set(donation);
    this.menu().toggle(event);
  }

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
