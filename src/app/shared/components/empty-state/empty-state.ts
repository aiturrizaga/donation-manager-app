import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly icon = input<string>('ti-inbox');
  readonly title = input<string>('Sin resultados');
  readonly description = input<string | null>(null);
  readonly iconClass = input<string>('');
  readonly iconSize = input<number | string | null>(null);

  readonly iconSizeStyle = computed(() => {
    const size = this.iconSize();
    if (size === null) return null;
    return typeof size === 'number' ? `${size}px` : size;
  });
}
