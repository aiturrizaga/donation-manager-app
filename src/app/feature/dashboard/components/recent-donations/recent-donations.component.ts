import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RecentDonation } from '../../models/dashboard.models';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';

type DonationStatus = RecentDonation['status'];
type DonationFrequency = RecentDonation['frequency'];

const STATUS_CONFIG: Record<
  DonationStatus,
  { label: string; severity: 'success' | 'warn' | 'danger' }
> = {
  completed: { label: 'Completado', severity: 'success' },
  pending: { label: 'Pendiente', severity: 'warn' },
  failed: { label: 'Fallido', severity: 'danger' },
};

const FREQUENCY_LABELS: Record<DonationFrequency, string> = {
  one_time: 'Único',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
};

const FREQUENCY_CLASSES: Record<DonationFrequency, string> = {
  one_time: 'bg-gray-100 text-gray-600',
  monthly: 'bg-blue-50 text-blue-700',
  quarterly: 'bg-purple-50 text-purple-700',
};

@Component({
  selector: 'app-recent-donations',
  standalone: true,
  imports: [CommonModule, DatePipe, TagModule, TableModule],
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

      <div class="overflow-x-auto">
        <p-table [value]="donations()" class="app-table">
          <ng-template #header>
            <tr>
              <th>Donante</th>
              <th>Campaña</th>
              <th>Monto</th>
              <th>Frecuencia</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </ng-template>
          <ng-template #body let-donation>
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center shrink-0"
                    >
                      {{ initials(donation.donorName) }}
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-800">{{
                        donation.donorName
                      }}</span>
                      <span class="text-xs text-gray-400">{{ donation.donorDocument }}</span>
                    </div>
                  </div>
                </td>
                <td class="text-sm text-gray-600 max-w-40 truncate">
                  {{ donation.campaignName }}
                </td>
                <td class="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {{ donation.currency }} {{ donation.amount | number: '1.2-2' }}
                </td>
                <td>
                  <span
                    class="text-xs px-2 py-0.5 rounded-full font-medium {{
                      frequencyClasses(donation.frequency)
                    }}"
                  >
                    {{ frequencyLabel(donation.frequency) }}
                  </span>
                </td>
                <td>
                  <p-tag
                    [value]="statusConfig(donation.status).label"
                    [severity]="statusConfig(donation.status).severity"
                  />
                </td>
                <td class="text-xs text-gray-400 whitespace-nowrap">
                  {{ donation.createdAt | date: 'dd MMM, HH:mm' : '' : 'es-PE' }}
                </td>
              </tr>
          </ng-template>
        </p-table>
      </div>
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

  frequencyLabel(frequency: DonationFrequency): string {
    return FREQUENCY_LABELS[frequency];
  }

  frequencyClasses(frequency: DonationFrequency): string {
    return FREQUENCY_CLASSES[frequency];
  }
}
