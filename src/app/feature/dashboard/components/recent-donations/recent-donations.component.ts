import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RecentDonation } from '../../models/dashboard.models';
import { TagModule } from 'primeng/tag';

type DonationStatus = RecentDonation['status'];
type DonationType = RecentDonation['donationType'];

const STATUS_CONFIG: Record<
  DonationStatus,
  { label: string; severity: 'success' | 'warn' | 'danger' | 'info' | 'secondary' }
> = {
  completed: { label: 'Completado', severity: 'success' },
  pending: { label: 'Pendiente', severity: 'warn' },
  processing: { label: 'Procesando', severity: 'info' },
  failed: { label: 'Fallido', severity: 'danger' },
  refunded: { label: 'Reembolsado', severity: 'secondary' },
  expired: { label: 'Expirado', severity: 'secondary' },
  cancelled: { label: 'Cancelado', severity: 'secondary' },
};

const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  one_time: 'Único',
  recurring: 'Recurrente',
};

const DONATION_TYPE_CLASSES: Record<DonationType, string> = {
  one_time: 'bg-gray-100 text-gray-600',
  recurring: 'bg-blue-50 text-blue-700',
};

@Component({
  selector: 'app-recent-donations',
  imports: [DatePipe, DecimalPipe, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <i class="ti ti-receipt text-primary-500" style="font-size: 1rem"></i>
          Donaciones recientes
        </h3>
        <span class="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
          {{ donations().length }} registros
        </span>
      </div>

      @if (donations().length === 0) {
        <p class="text-sm text-gray-400 text-center py-8">No hay donaciones recientes.</p>
      } @else {
        <div class="flex flex-col divide-y divide-gray-100 px-5">
          @for (donation of donations(); track donation.id) {
            <div class="flex items-center justify-between gap-4 py-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center shrink-0"
                >
                  {{ initials(donation.donorName) }}
                </div>
                <div class="flex flex-col min-w-0 gap-0.5">
                  <span class="text-sm font-medium text-gray-800 truncate">{{ donation.donorName }}</span>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-xs text-gray-400 truncate">{{ donation.campaignName }}</span>
                    <span
                      class="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 {{
                        donationTypeClasses(donation.donationType)
                      }}"
                    >
                      {{ donationTypeLabel(donation.donationType) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1 shrink-0">
                <span class="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {{ donation.currency }} {{ donation.amount | number: '1.2-2' }}
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400 whitespace-nowrap">
                    {{ donation.createdAt | date: 'dd MMM, HH:mm' : '' : 'es-PE' }}
                  </span>
                  <p-tag
                    [value]="statusConfig(donation.status).label"
                    [severity]="statusConfig(donation.status).severity"
                  />
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class RecentDonationsComponent {
  donations = input.required<RecentDonation[]>();

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  statusConfig(status: DonationStatus) {
    return STATUS_CONFIG[status];
  }

  donationTypeLabel(donationType: DonationType): string {
    return DONATION_TYPE_LABELS[donationType];
  }

  donationTypeClasses(donationType: DonationType): string {
    return DONATION_TYPE_CLASSES[donationType];
  }
}
