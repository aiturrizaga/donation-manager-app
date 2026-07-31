import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-table-skeleton',
  imports: [Skeleton],
  template: `
    <div class="flex flex-col gap-3 p-4">
      @for (row of rowsArray(); track $index) {
        <div class="flex gap-4">
          @for (col of columnsArray(); track $index) {
            <p-skeleton height="1.25rem" styleClass="flex-1" />
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeleton {
  readonly rows = input(5);
  readonly columns = input(4);

  protected readonly rowsArray = computed(() => Array(this.rows()).fill(0));
  protected readonly columnsArray = computed(() => Array(this.columns()).fill(0));
}
