import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { EmptyState } from '@shared/components';
import { DonationApi } from '@shared/api/donation.api';
import { Donation } from '@domain/donation';
import { environment } from '@env/environment';

@Component({
  selector: 'app-donor-profile-certificates',
  imports: [DatePipe, TableModule, Tag, Button, Tooltip, EmptyState, DecimalPipe],
  templateUrl: './donor-profile-certificates.html',
})
export class DonorProfileCertificates implements OnInit {
  readonly donorId = input.required<string>();
  readonly #donationApi = inject(DonationApi);

  readonly items = signal<Donation[]>([]);
  readonly loading = signal(true);
  readonly total = signal(0);
  readonly first = signal(0);
  readonly rows = signal(10);

  ngOnInit(): void {
    this.loadPage(0, this.rows());
  }

  onPageChange(event: TablePageEvent): void {
    const rows = event.rows ?? this.rows();
    this.rows.set(rows);
    this.first.set(event.first ?? 0);
    this.loadPage(event.first ?? 0, rows);
  }

  private loadPage(first: number, rows: number): void {
    this.loading.set(true);
    const page = Math.floor(first / rows) + 1;
    this.#donationApi
      .getAll(
        { page, size: rows },
        { donorId: this.donorId(), status: 'completed', hasCertificate: true },
      )
      .subscribe({
        next: (data) => {
          this.items.set(data.items);
          this.total.set(data.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  downloadCertificate(fileUrl: string): void {
    // fileUrl is a relative path from the API (e.g. /v1/portal/certificates/{id}/download) —
    // must be resolved against the API origin, not this app's own origin.
    window.open(`${environment.apiUrl}${fileUrl}`, '_blank');
  }
}
