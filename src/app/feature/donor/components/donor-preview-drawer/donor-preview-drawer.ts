import { Component, effect, inject, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Drawer } from 'primeng/drawer';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { Divider } from 'primeng/divider';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Donor } from '../../models/donor.model';
import { DonationApi } from '../../../donation/api/donation.api';

@Component({
  selector: 'app-donor-preview-drawer',
  imports: [Drawer, Avatar, Tag, Skeleton, Divider, Button, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './donor-preview-drawer.html',
})
export class DonorPreviewDrawer {
  readonly donor = input.required<Donor>();
  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();

  readonly #donationApi = inject(DonationApi);

  readonly donations = signal<any[]>([]);
  readonly loadingDonations = signal(false);
  readonly totalDonated = signal(0);
  readonly donationCount = signal(0);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this._loadDonations();
      }
    });
  }

  private _loadDonations(): void {
    this.loadingDonations.set(true);
    this.#donationApi
      .getAll({ page: 1, size: 50 }, { donorId: this.donor().id })
      .pipe()
      .subscribe({
        next: (data) => {
          const completed = data.items.filter((d) => d.status === 'completed');
          this.donations.set(data.items);
          this.donationCount.set(completed.length);
          this.totalDonated.set(completed.reduce((sum, d) => sum + Number(d.amount), 0));
          this.loadingDonations.set(false);
        },
        error: () => this.loadingDonations.set(false),
      });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      completed: 'success',
      pending: 'warn',
      failed: 'danger',
      refunded: 'secondary',
      expired: 'secondary',
    };
    return map[status] ?? 'secondary';
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

  close(): void {
    this.visibleChange.emit(false);
  }
}
