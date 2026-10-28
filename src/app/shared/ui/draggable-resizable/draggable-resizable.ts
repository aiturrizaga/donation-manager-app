import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface DraggableResizableRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A free-floating, draggable, resizable box meant to overlay an image on top
 * of `certificate-template-editor`'s page canvas (logo/seal/signature). No
 * drag/resize library existed anywhere in this app, so this is hand-rolled
 * with plain pointer events rather than pulling in a new dependency (Angular
 * CDK's drag-drop positions via its own CSS transform, which would fight
 * with the absolute x/y/w/h this component tracks directly and that gets
 * saved to the backend 1:1, converted to mm — see certificate-template-editor.ts).
 *
 * Click-to-select, Word/Docs-style: the resize handle and outline only show
 * once this box is selected (a plain click selects it without moving it);
 * clicking anywhere outside deselects.
 */
@Component({
  selector: 'app-draggable-resizable',
  templateUrl: './draggable-resizable.html',
  styleUrl: './draggable-resizable.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-draggable-resizable',
    '[class.selected]': 'selected()',
    '[style.left.px]': 'x()',
    '[style.top.px]': 'y()',
    '[style.width.px]': 'w()',
    '[style.height.px]': 'h()',
    '(pointerdown)': 'onDragStart($event)',
  },
})
export class DraggableResizable {
  readonly #host = inject(ElementRef<HTMLElement>);
  readonly #destroyRef = inject(DestroyRef);

  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly w = input.required<number>();
  readonly h = input.required<number>();
  readonly containerWidth = input.required<number>();
  readonly containerHeight = input.required<number>();
  readonly minSize = input(20);
  /** CSS scale applied to the page this box sits on (see certificate-template-
   * editor's `transform: scale()` wrapper) — 1 real screen pixel of pointer
   * movement only equals 1 page-space pixel at scale 1; at a smaller scale
   * the page moves more (in its own coordinate space) than the mouse does on
   * screen, so deltas must be divided by this to stay in sync with the cursor. */
  readonly scale = input(1);

  readonly changed = output<DraggableResizableRect>();

  protected readonly selected = signal(false);

  constructor() {
    // Click anywhere outside this box deselects it (Word/Docs-style) — one
    // listener per instance (there are only ever three: logo/seal/signature).
    const onOutsidePointerDown = (e: PointerEvent) => {
      if (!this.#host.nativeElement.contains(e.target as Node)) {
        this.selected.set(false);
      }
    };
    window.addEventListener('pointerdown', onOutsidePointerDown, true);
    this.#destroyRef.onDestroy(() => {
      window.removeEventListener('pointerdown', onOutsidePointerDown, true);
    });
  }

  onDragStart(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.selected.set(true);

    const startX = event.clientX;
    const startY = event.clientY;
    const originX = this.x();
    const originY = this.y();
    const w = this.w();
    const h = this.h();
    const maxX = Math.max(0, this.containerWidth() - w);
    const maxY = Math.max(0, this.containerHeight() - h);
    // Seeded with the CURRENT rect, not zero — a plain click (pointerdown
    // immediately followed by pointerup, no pointermove in between) must
    // leave the box exactly where it was. Previously this started at
    // {0,0,0,0} and only onMove ever updated it, so a click-without-drag
    // emitted that zeroed rect on pointerup and collapsed the image to
    // nothing — the "image disappears when I click it" bug.
    let current: DraggableResizableRect = { x: originX, y: originY, w, h };
    let moved = false;

    const onMove = (e: PointerEvent) => {
      moved = true;
      const nextX = clamp(originX + (e.clientX - startX) / this.scale(), 0, maxX);
      const nextY = clamp(originY + (e.clientY - startY) / this.scale(), 0, maxY);
      current = { x: nextX, y: nextY, w, h };
      this.#applyLive(current);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (moved) this.changed.emit(current);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  onResizeStart(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.selected.set(true);

    const startX = event.clientX;
    const x = this.x();
    const y = this.y();
    const originW = this.w();
    const originH = this.h();
    const aspectRatio = originH > 0 ? originW / originH : 1;
    const min = this.minSize();
    const maxW = this.containerWidth() - x;
    let current: DraggableResizableRect = { x, y, w: originW, h: originH };
    let moved = false;

    const onMove = (e: PointerEvent) => {
      moved = true;
      const deltaX = (e.clientX - startX) / this.scale();
      const nextW = clamp(originW + deltaX, min, maxW);
      const nextH = nextW / aspectRatio;
      current = { x, y, w: nextW, h: nextH };
      this.#applyLive(current);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (moved) this.changed.emit(current);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  /** Imperative DOM write during the live gesture only — avoids a full
   * change-detection cycle per pointermove. The final value is committed
   * through `changed` -> the parent's signal -> back into x()/y()/w()/h(),
   * which re-asserts the same position via the host bindings once settled. */
  #applyLive(rect: DraggableResizableRect): void {
    const el = this.#host.nativeElement;
    el.style.left = `${rect.x}px`;
    el.style.top = `${rect.y}px`;
    el.style.width = `${rect.w}px`;
    el.style.height = `${rect.h}px`;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
