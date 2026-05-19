import { Component, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';

@Component({
  selector: 'app-donation-detail-webhooks',
  imports: [DatePipe, TableModule, Tag, Skeleton, EmptyState],
  templateUrl: './donation-detail-webhooks.html',
})
export class DonationDetailWebhooks implements OnInit {
  readonly donationId = input.required<string>();

  readonly items = signal<any[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    // TODO: load webhook events for this donation
  }
}
