import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { DonorsByMonth } from '../../models/dashboard.models';

@Component({
  selector: 'app-donors-summary',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <i class="ti ti-users text-primary-500" style="font-size: 1rem"></i>
          Donantes por mes
        </h3>
        <div class="flex items-center gap-2">
          <span
            class="w-2.5 h-2.5 rounded-full inline-block"
            style="background: rgba(99,153,34,0.85)"
          ></span>
          <span class="text-xs text-gray-500 mr-2">Nuevos</span>
          <span
            class="w-2.5 h-2.5 rounded-full inline-block"
            style="background: rgba(55,138,221,0.85)"
          ></span>
          <span class="text-xs text-gray-500">Recurrentes</span>
        </div>
      </div>

      <div class="p-5 h-[220px]">
        <p-chart type="bar" [data]="chartData()" [options]="chartOptions" />
      </div>
    </div>
  `,
})
export class DonorsSummaryComponent {
  data = input.required<DonorsByMonth[]>();

  chartData = computed(() => ({
    labels: this.data().map((d) => d.month),
    datasets: [
      {
        label: 'Nuevos',
        data: this.data().map((d) => d.newDonors),
        backgroundColor: 'rgba(99, 153, 34, 0.85)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Recurrentes',
        data: this.data().map((d) => d.recurringDonors),
        backgroundColor: 'rgba(55, 138, 221, 0.85)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }));

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 12 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        border: { display: false, dash: [4, 4] },
        ticks: { color: '#94a3b8', font: { size: 12 }, stepSize: 10 },
      },
    },
  };
}
