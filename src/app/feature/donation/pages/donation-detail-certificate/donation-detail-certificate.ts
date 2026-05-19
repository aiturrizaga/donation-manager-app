import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';
import { DonationCertificateApi } from '../../api/donation-certificate.api';

@Component({
  selector: 'app-donation-detail-certificate',
  imports: [DatePipe, DecimalPipe, Button, Tag, Skeleton, EmptyState],
  templateUrl: './donation-detail-certificate.html',
})
export class DonationDetailCertificate implements OnInit {
  readonly donationId = input.required<string>();
  readonly #api = inject(DonationCertificateApi);

  readonly certificate = signal<any | null>(null);
  readonly loading = signal(true);
  readonly generating = signal(false);

  ngOnInit(): void {
    this._load();
  }

  private _load(): void {
    this.loading.set(true);
    this.#api.getByDonation(this.donationId()).subscribe({
      next: (cert) => {
        this.certificate.set(cert);
        this.loading.set(false);
      },
      error: () => {
        this.certificate.set(null);
        this.loading.set(false);
      },
    });
  }

  generate(): void {
    this.generating.set(true);
    this.#api.generate(this.donationId(), { forceRegenerate: false }).subscribe({
      next: (cert) => {
        this.certificate.set(cert);
        this.generating.set(false);
      },
      error: () => this.generating.set(false),
    });
  }

  download(): void {
    window.open(this.certificate()?.fileUrl, '_blank');
  }
}
