import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { EmptyState } from '@shared/components';
import { DonationApi } from '../../../donation/api/donation.api';

@Component({
  selector: 'app-donor-profile-certificates',
  imports: [DatePipe, TableModule, Tag, Button, EmptyState, DecimalPipe],
  templateUrl: './donor-profile-certificates.html',
})
export class DonorProfileCertificates implements OnInit {
  readonly donorId = input.required<string>();
  readonly #donationApi = inject(DonationApi);

  readonly items = signal<any[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    // Load completed donations that have a certificate
    this.#donationApi
      .getAll({ page: 1, size: 100 }, { donorId: this.donorId(), status: 'completed' })
      .subscribe({
        next: (data) => {
          this.items.set(data.items.filter((d) => d.hasCertificate));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  downloadCertificate(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }
}
