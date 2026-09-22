import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { DonorsByMonth } from '../../models/dashboard.models';
import { ThemeService } from '@core/theme';

@Component({
  selector: 'app-donors-summary',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
        <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
          <i class="ti ti-users text-primary-500" style="font-size: 1rem"></i>
          Donantes por mes
        </h3>
        <div class="flex items-center gap-2">
          <span
            class="w-2.5 h-2.5 rounded-full inline-block"
            style="background: rgba(99,153,34,0.85)"
          ></span>
          <span class="text-xs text-gray-500 dark:text-zinc-400 mr-2">Nuevos</span>
          <span
            class="w-2.5 h-2.5 rounded-full inline-block"
            style="background: rgba(55,138,221,0.85)"
          ></span>
          <span class="text-xs text-gray-500 dark:text-zinc-400">Recurrentes</span>
        </div>
      </div>

      <div class="p-5 h-[220px]">
        <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" />
      </div>
    </div>
  `,
})
export class DonorsSummaryComponent {
  readonly #theme = inject(ThemeService);

  data = input.required<DonorsByMonth[]>();

  chartData = computed(() => ({
    labels: this.data().map((d) => d.label),
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

  // Chart.js draws to a <canvas> — it has no CSS access, so the grid/tick
  // colors can't just be `dark:` classes like the rest of the template.
  // Recomputed whenever the theme flips so the chart actually repaints.
  chartOptions = computed(() => {
    const isDark = this.#theme.isDark();

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#f8fafc' : '#1e293b',
          titleColor: isDark ? '#1e293b' : '#f8fafc',
          bodyColor: isDark ? '#334155' : '#cbd5e1',
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
          border: { display: false },
          ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 12 } },
        },
        y: {
          grid: { color: isDark ? 'rgba(148, 163, 184, 0.15)' : '#f1f5f9' },
          border: { display: false, dash: [4, 4] },
          ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 12 }, stepSize: 10 },
        },
      },
    };
  });
}
