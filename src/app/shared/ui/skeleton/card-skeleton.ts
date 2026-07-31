import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-card-skeleton',
  imports: [Skeleton],
  template: `
    <div class="flex flex-col gap-2 p-4">
      <p-skeleton width="60%" height="1rem" styleClass="mb-2" />
      @for (line of linesArray(); track $index) {
        <p-skeleton height="0.85rem" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSkeleton {
  readonly lines = input(3);

  protected readonly linesArray = computed(() => Array(this.lines()).fill(0));
}
