import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { EmptyState } from '@shared/components';
import { User } from '../../models/user.model';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-data-view',
  imports: [
    FormsModule,
    TableModule,
    Tag,
    Button,
    Skeleton,
    ToggleSwitch,
    Menu,
    Paginator,
    EmptyState,
    AvatarModule,
  ],
  templateUrl: './user-data-view.html',
})
export class UserDataView {
  readonly items = input.required<User[]>();
  readonly isLoading = input<boolean>(false);
  readonly total = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly toggleActive = output<User>();
  readonly resetPassword = output<User>();
  readonly delete = output<User>();
  readonly pageChange = output<{ first: number; rows: number }>();

  readonly skeletonRows = Array(5).fill({});

  readonly menu = viewChild.required<Menu>('menu');
  selectedUser = signal<User | null>(null);

  readonly menuItems = computed((): MenuItem[] => {
    const user = this.selectedUser();
    if (!user) return [];
    return [
      {
        label: 'Restablecer contraseña',
        icon: 'ti ti-lock-open',
        command: () => this.resetPassword.emit(user),
      },
      { separator: true },
      {
        label: 'Eliminar usuario',
        icon: 'ti ti-trash',
        labelClass: 'text-red-500!',
        iconClass: 'text-red-500!',
        styleClass: 'bg-red-50!',
        command: () => this.delete.emit(user),
      },
    ];
  });

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getRoleLabel(role: string): string {
    return role === 'super_admin' ? 'Super Admin' : 'Admin';
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return role === 'super_admin' ? 'danger' : 'secondary';
  }

  openMenu(event: MouseEvent, user: User): void {
    this.selectedUser.set(user);
    this.menu().toggle(event);
  }

  onPageChange(event: TablePageEvent | PaginatorState): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }
}
