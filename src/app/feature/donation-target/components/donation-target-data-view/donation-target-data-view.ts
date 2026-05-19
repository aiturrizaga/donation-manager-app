import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { EmptyState } from '@shared/components';
import { DonationTarget } from '../../models/donation-target.model';

@Component({
  selector: 'app-donation-target-data-view',
  imports: [DatePipe, DecimalPipe, TableModule, Tag, Button, Skeleton, Menu, Paginator, EmptyState],
  templateUrl: './donation-target-data-view.html',
})
export class DonationTargetDataView {
  readonly items = input.required<DonationTarget[]>();
  readonly isLoading = input<boolean>(false);
  readonly total = input<number>(0);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('');
  readonly emptyDescription = input<string>('');

  readonly edit = output<DonationTarget>();
  readonly setStatus = output<{
    target: DonationTarget;
    status: 'active' | 'paused' | 'finished';
  }>();
  readonly delete = output<DonationTarget>();
  readonly pageChange = output<{ first: number; rows: number }>();

  readonly skeletonRows = Array(5).fill({});
  readonly menu = viewChild.required<Menu>('menu');
  readonly selectedTarget = signal<DonationTarget | null>(null);

  protected readonly Math = Math;

  readonly menuItems = computed((): MenuItem[] => {
    const target = this.selectedTarget();
    if (!target) return [];

    const statusItems: MenuItem[] = [];

    if (target.status !== 'active') {
      statusItems.push({
        label: 'Activar',
        icon: 'ti ti-player-play',
        command: () => this.setStatus.emit({ target, status: 'active' }),
      });
    }
    if (target.status !== 'paused') {
      statusItems.push({
        label: 'Pausar',
        icon: 'ti ti-player-pause',
        command: () => this.setStatus.emit({ target, status: 'paused' }),
      });
    }
    if (target.status !== 'finished') {
      statusItems.push({
        label: 'Finalizar',
        icon: 'ti ti-flag-check',
        command: () => this.setStatus.emit({ target, status: 'finished' }),
      });
    }

    return [
      {
        label: 'Editar',
        icon: 'ti ti-pencil',
        command: () => this.edit.emit(target),
      },
      { separator: true },
      ...statusItems,
      { separator: true },
      {
        label: 'Eliminar',
        icon: 'ti ti-trash',
        labelClass: 'text-red-500!',
        iconClass: 'text-red-500!',
        styleClass: 'bg-red-50!',
        command: () => this.delete.emit(target),
      },
    ];
  });

  openMenu(event: MouseEvent, target: DonationTarget): void {
    this.selectedTarget.set(target);
    this.menu().toggle(event);
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Activo',
      paused: 'Pausado',
      finished: 'Finalizado',
    };
    return map[status] ?? status;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'secondary' {
    const map: Record<string, any> = {
      active: 'success',
      paused: 'warn',
      finished: 'secondary',
    };
    return map[status] ?? 'secondary';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      cause: 'Causa',
      group: 'Grupo',
      campaign: 'Campaña',
      goal: 'Meta',
    };
    return map[type] ?? type;
  }

  onPageChange(event: TablePageEvent | PaginatorState): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
    });
  }
}
