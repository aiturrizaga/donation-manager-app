import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Button } from 'primeng/button';

/**
 * Wraps a set of filter controls (projected via content) so they render
 * inline on desktop but collapse into a "Filtros" button + bottom sheet on
 * mobile, where a row of several controls would otherwise push the list far
 * down the screen or overflow the card.
 *
 * The projected content lives in exactly ONE <ng-content> outlet, always
 * present in the DOM — only repositioned/shown via CSS (see filters-panel.scss).
 * An earlier version tried to structurally switch between two @if-branches
 * each with their own <ng-content>, but Angular only re-projects content
 * into whichever outlet existed at initial render; toggling branches later
 * silently dropped the content instead of moving it.
 */
@Component({
  selector: 'app-filters-panel',
  imports: [Button],
  templateUrl: './filters-panel.html',
  styleUrl: './filters-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersPanel {
  // Number of filters currently applied — drives the trigger button's badge
  // and color, and whether "Limpiar filtros" is shown in the sheet header.
  readonly activeCount = input<number>(0);
  readonly clear = output<void>();

  readonly open = signal(false);
}
