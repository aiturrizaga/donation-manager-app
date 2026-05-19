import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Avatar } from 'primeng/avatar';
import { EmptyState } from '@shared/components';
import { Donor } from '../../models/donor.model';

@Component({
  selector: 'app-donor-data-view',
  imports: [
    FormsModule,
    RouterLink,
    TableModule,
    Button,
    Skeleton,
    ToggleSwitch,
    Menu,
    Paginator,
    Avatar,
    EmptyState,
  ],
  templateUrl: './donor-data-view.html',
})
export class DonorDataView {
  readonly items = input.required<Donor[]>();
  readonly isLoading = input<boolean>(false);
  readonly total = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly toggleActive = output<Donor>();
  readonly preview = output<Donor>();
  readonly delete = output<Donor>();
  readonly pageChange = output<{ first: number; rows: number }>();

  readonly skeletonRows = Array(5).fill({});
  readonly menu = viewChild.required<Menu>('menu');
  readonly selectedDonor = signal<Donor | null>(null);

  readonly menuItems = computed((): MenuItem[] => {
    const donor = this.selectedDonor();
    if (!donor) return [];
    return [
      {
        label: 'Vista previa',
        icon: 'ti ti-eye',
        command: () => this.preview.emit(donor),
      },
      { separator: true },
      {
        label: 'Eliminar donante',
        icon: 'ti ti-trash',
        labelClass: 'text-red-500!',
        iconClass: 'text-red-500!',
        styleClass: 'bg-red-50!',
        command: () => this.delete.emit(donor),
      },
    ];
  });

  openMenu(event: MouseEvent, donor: Donor): void {
    this.selectedDonor.set(donor);
    this.menu().toggle(event);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  onPageChange(event: TablePageEvent | PaginatorState): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }
}
