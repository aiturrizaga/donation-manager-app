import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-form-skeleton',
  imports: [Skeleton],
  template: `
    <div class="flex flex-col gap-4 p-4">
      @for (field of fieldsArray(); track $index) {
        <div class="flex flex-col gap-1.5">
          <p-skeleton width="30%" height="0.8rem" />
          <p-skeleton height="2.25rem" />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSkeleton {
  readonly fields = input(6);

  protected readonly fieldsArray = computed(() => Array(this.fields()).fill(0));
}
