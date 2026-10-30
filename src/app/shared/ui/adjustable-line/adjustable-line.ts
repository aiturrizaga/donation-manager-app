import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface AdjustableLineValue {
  x: number;
  w: number;
}

type Grip = 'start' | 'end' | 'move';

/**
 * A horizontal line that can be lengthened/shortened from either end and
 * slid sideways, Word-style (click to select, then drag the end grips or the
 * line itself). Used for the certificate's signature line, whose length and
 * horizontal position are saved and drawn identically in the PDF.
 *
 * `x` is relative to this element's normal-flow position (applied as a
 * margin-left), so the line stays in the document flow vertically. `minX` /
 * `maxRight` bound it horizontally in that same coordinate space. Deltas are
 * divided by `scale` because the page is CSS-scaled for zoom.
 */
@Component({
  selector: 'app-adjustable-line',
  template: `
    <div class="line"></div>
    <div class="grip grip-start" (pointerdown)="onPointerDown($event, 'start')"></div>
    <div class="grip grip-end" (pointerdown)="onPointerDown($event, 'end')"></div>
  `,
  styleUrl: './adjustable-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-adjustable-line',
    '[class.selected]': 'selected()',
    '[style.margin-left.px]': 'live().x',
    '[style.width.px]': 'live().w',
    '(pointerdown)': 'onPointerDown($event, "move")',
  },
})
export class AdjustableLine {
  readonly #host = inject(ElementRef<HTMLElement>);

  readonly x = input.required<number>();
  readonly w = input.required<number>();
  readonly minX = input(-Infinity);
  readonly maxRight = input(Infinity);
  readonly minWidth = input(20);
  readonly scale = input(1);

  readonly changed = output<AdjustableLineValue>();

  protected readonly selected = signal(false);
  readonly #gesture = signal<AdjustableLineValue | null>(null);
  protected readonly live = computed(() => this.#gesture() ?? { x: this.x(), w: this.w() });

  constructor() {
    const onOutsidePointerDown = (e: PointerEvent) => {
      if (!this.#host.nativeElement.contains(e.target as Node)) this.selected.set(false);
    };
    window.addEventListener('pointerdown', onOutsidePointerDown, true);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('pointerdown', onOutsidePointerDown, true));
  }

  protected onPointerDown(event: PointerEvent, grip: Grip): void {
    event.preventDefault();
    event.stopPropagation();
    this.selected.set(true);

    const startX = event.clientX;
    const { x, w } = this.live();
    const right = x + w;
    const min = this.minWidth();
    let moved = false;

    const onMove = (e: PointerEvent) => {
      moved = true;
      const dx = (e.clientX - startX) / this.scale();
      let next: AdjustableLineValue;
      if (grip === 'start') {
        const nextX = clamp(x + dx, this.minX(), right - min);
        next = { x: nextX, w: right - nextX };
      } else if (grip === 'end') {
        next = { x, w: clamp(w + dx, min, this.maxRight() - x) };
      } else {
        next = { x: clamp(x + dx, this.minX(), this.maxRight() - w), w };
      }
      this.#gesture.set(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const value = this.#gesture();
      if (moved && value) this.changed.emit(value);
      this.#gesture.set(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
