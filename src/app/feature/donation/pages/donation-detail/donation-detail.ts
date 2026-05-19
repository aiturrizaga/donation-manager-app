import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ConfirmationService } from 'primeng/api';
import { Donation } from '../../models/donation.model';
import { DonationApi } from '../../api/donation.api';
import { DonationDetailCertificate } from '../donation-detail-certificate/donation-detail-certificate';
import { DonationDetailWebhooks } from '../donation-detail-webhooks/donation-detail-webhooks';

@Component({
  selector: 'app-donation-detail-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    Button,
    Tag,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    DonationDetailCertificate,
    DonationDetailWebhooks,
    SlicePipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './donation-detail.html',
})
export class DonationDetailPage {
  readonly #router = inject(Router);
  readonly #api = inject(DonationApi);
  readonly #confirm = inject(ConfirmationService);

  readonly donation = input.required<Donation>();
  readonly refunding = signal(false);

  readonly isRefundable = computed(
    () => this.donation().status === 'completed' && this.donation().culqiChargeId !== null,
  );

  readonly orgName = computed(
    () =>
      this.donation().donationPage?.organization?.tradeName ??
      this.donation().donationPage?.organization?.legalName ??
      '—',
  );

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

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
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

  onRefund(): void {
    this.#confirm.confirm({
      message:
        '¿Estás seguro de marcar esta donación como reembolsada? Esta acción no se puede deshacer.',
      header: 'Reembolsar donación',
      icon: 'ti ti-receipt-refund',
      rejectLabel: 'No',
      acceptLabel: 'Sí, reembolsar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this._processRefund(),
    });
  }

  private _processRefund(): void {
    this.refunding.set(true);
    this.#api
      .refund(this.donation().id, { refundReason: 'Reembolso solicitado por administrador' })
      .pipe()
      .subscribe({
        next: () => {
          this.refunding.set(false);
          this.#router.navigate(['/donations']);
        },
        error: () => this.refunding.set(false),
      });
  }

  goBack(): void {
    this.#router.navigate(['/donations']);
  }
}
