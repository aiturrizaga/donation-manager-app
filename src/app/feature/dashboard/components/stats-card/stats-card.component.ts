import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl p-5 border border-gray-100 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-500">{{ label() }}</span>
        <div
          class="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600"
        >
          <i class="ti {{ icon() }}" style="font-size: 1.1rem"></i>
        </div>
      </div>

      <div class="text-2xl font-semibold text-gray-900 tracking-tight">
        {{ formattedValue() }}
      </div>

      <div
        class="flex items-center gap-1.5 text-sm font-medium"
        [class.text-emerald-600]="delta() >= 0"
        [class.text-red-500]="delta() < 0"
      >
        <i class="ti {{ deltaIcon() }}" style="font-size: 0.9rem"></i>
        <span>{{ deltaLabel() }}</span>
        <span class="text-gray-400 font-normal ml-0.5">vs. mes anterior</span>
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  label = input.required<string>();
  value = input.required<number>();
  icon = input.required<string>();
  delta = input.required<number>();
  prefix = input<string>('');
  suffix = input<string>('');
  decimals = input<number>(0);

  formattedValue(): string {
    const formatted = this.value().toLocaleString('es-PE', {
      minimumFractionDigits: this.decimals(),
      maximumFractionDigits: this.decimals(),
    });
    return `${this.prefix()}${formatted}${this.suffix()}`;
  }

  deltaIcon(): string {
    return this.delta() >= 0 ? 'ti-trending-up' : 'ti-trending-down';
  }

  deltaLabel(): string {
    const abs = Math.abs(this.delta());
    return `${this.delta() >= 0 ? '+' : '-'}${abs.toFixed(1)}%`;
  }
}
