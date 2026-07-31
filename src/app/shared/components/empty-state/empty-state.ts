import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonDirective, ButtonLabel } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  imports: [ButtonDirective, ButtonLabel],
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly icon = input<string>('ti-inbox');
  readonly title = input<string>('Sin resultados');
  readonly description = input<string | null>(null);
  readonly iconClass = input<string>('');
  readonly iconSize = input<number | string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();

  readonly iconSizeStyle = computed(() => {
    const size = this.iconSize();
    if (size === null) return null;
    return typeof size === 'number' ? `${size}px` : size;
  });
}
