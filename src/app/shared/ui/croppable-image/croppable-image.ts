import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

export interface ImageFrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Fraction (0..1) of the image's natural width (left/right) or height
 * (top/bottom) trimmed off each side — the same contract the backend uses to
 * crop the image before drawing it (app/core/certificate/template_generator.py). */
export interface ImageCrop {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CroppableImageValue {
  rect: ImageFrameRect;
  crop: ImageCrop;
}

export interface ImageNaturalSize {
  width: number;
  height: number;
}

export const NO_CROP: ImageCrop = { left: 0, top: 0, right: 0, bottom: 0 };

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

// Never let a crop leave less than this fraction of the image visible on an
// axis — mirrors the backend's validation (left+right <= 0.95).
const MIN_VISIBLE_FRACTION = 0.05;

// Toolbar buttons that act on the selected image (crop, reset...) carry this
// attribute so clicking them doesn't count as an "outside" click that would
// deselect the image before the button's own handler runs.
export const IMAGE_TOOLBAR_ATTR = 'data-image-toolbar';

/**
 * A free-floating image on `certificate-template-editor`'s A4 canvas that can
 * be moved, resized and cropped, Word/Google Docs-style:
 *
 * - The image is always drawn STRETCHED to the frame (no object-fit: contain),
 *   exactly how fpdf2 draws it at x/y/w/h in the PDF — what you see in the
 *   editor is what the certificate gets.
 * - Corner handles resize keeping the current proportion (hold Shift to
 *   stretch freely); side handles stretch one axis only.
 * - Crop mode (double-click, or the parent's toolbar via `cropping`): the
 *   handles trim the image's edges instead of scaling it, the hidden part is
 *   shown ghosted around the frame, and dragging pans the image inside the
 *   frame. Enter/Escape, a double-click or a click outside leaves crop mode.
 *
 * Pointer handling is hand-rolled (no drag library in this app); live values
 * are kept in local signals and only emitted through `changed` once a gesture
 * ends. Deltas are divided by `scale` because the page is CSS-scaled for zoom.
 */
@Component({
  selector: 'app-croppable-image',
  templateUrl: './croppable-image.html',
  styleUrl: './croppable-image.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-croppable-image',
    '[class.selected]': 'selected()',
    '[class.cropping]': 'cropping()',
    '[style.left.px]': 'live().rect.x',
    '[style.top.px]': 'live().rect.y',
    '[style.width.px]': 'live().rect.w',
    '[style.height.px]': 'live().rect.h',
    '(pointerdown)': 'onBodyPointerDown($event)',
    '(dblclick)': 'toggleCropping()',
  },
})
export class CroppableImage {
  readonly #host = inject(ElementRef<HTMLElement>);
  readonly #destroyRef = inject(DestroyRef);

  readonly src = input.required<string>();
  readonly alt = input('');
  readonly rect = input.required<ImageFrameRect>();
  readonly crop = input<ImageCrop>(NO_CROP);
  readonly containerWidth = input.required<number>();
  readonly containerHeight = input.required<number>();
  readonly minSize = input(20);
  /** CSS scale applied to the page (editor zoom). */
  readonly scale = input(1);

  readonly selected = model(false);
  readonly cropping = model(false);

  readonly changed = output<CroppableImageValue>();
  readonly loaded = output<ImageNaturalSize>();

  protected readonly handles = HANDLES;

  // Mirrors rect/crop inputs, overridden while a gesture is in progress.
  readonly #gesture = signal<CroppableImageValue | null>(null);
  protected readonly live = computed<CroppableImageValue>(
    () => this.#gesture() ?? { rect: this.rect(), crop: this.crop() },
  );

  /** Inner <img> placement (percent of the frame) so only the uncropped
   * part shows, stretched to fill the frame. */
  protected readonly imageStyle = computed(() => {
    const { left, top, right, bottom } = this.live().crop;
    const visibleW = 1 - left - right;
    const visibleH = 1 - top - bottom;
    return {
      width: 100 / visibleW,
      height: 100 / visibleH,
      left: (-left / visibleW) * 100,
      top: (-top / visibleH) * 100,
    };
  });

  /** Full (uncropped) image placement in px relative to the frame, for the
   * ghost shown in crop mode. */
  protected readonly ghostRect = computed(() => fullImageRect(this.live()));

  constructor() {
    effect(() => {
      if (!this.selected()) this.cropping.set(false);
    });

    const onOutsidePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (this.#host.nativeElement.contains(target)) return;
      if (target instanceof Element && target.closest(`[${IMAGE_TOOLBAR_ATTR}]`)) return;
      this.selected.set(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (this.cropping() && (e.key === 'Enter' || e.key === 'Escape')) {
        e.preventDefault();
        this.cropping.set(false);
      }
    };
    window.addEventListener('pointerdown', onOutsidePointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    this.#destroyRef.onDestroy(() => {
      window.removeEventListener('pointerdown', onOutsidePointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
    });
  }

  toggleCropping(): void {
    this.selected.set(true);
    this.cropping.update((v) => !v);
  }

  protected onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.naturalWidth && img.naturalHeight) {
      this.loaded.emit({ width: img.naturalWidth, height: img.naturalHeight });
    }
  }

  protected onBodyPointerDown(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.selected.set(true);
    const origin = this.live();
    this.#track(event, (dx, dy) => (this.cropping() ? panCrop(origin, dx, dy) : this.#move(origin, dx, dy)));
  }

  protected onHandlePointerDown(event: PointerEvent, handle: Handle): void {
    event.preventDefault();
    event.stopPropagation();
    this.selected.set(true);
    const origin = this.live();
    this.#track(event, (dx, dy, e) =>
      this.cropping()
        ? this.#cropEdges(origin, handle, dx, dy)
        : this.#resize(origin, handle, dx, dy, !e.shiftKey),
    );
  }

  /** Runs `next` on every pointermove with page-space deltas; emits the last
   * value on pointerup only if the pointer actually moved (a plain click must
   * leave the image untouched). */
  #track(
    start: PointerEvent,
    next: (dx: number, dy: number, e: PointerEvent) => CroppableImageValue,
  ): void {
    let moved = false;
    const onMove = (e: PointerEvent) => {
      moved = true;
      const scale = this.scale();
      this.#gesture.set(next((e.clientX - start.clientX) / scale, (e.clientY - start.clientY) / scale, e));
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

  #move(origin: CroppableImageValue, dx: number, dy: number): CroppableImageValue {
    const { x, y, w, h } = origin.rect;
    return {
      crop: origin.crop,
      rect: {
        x: clamp(x + dx, 0, this.containerWidth() - w),
        y: clamp(y + dy, 0, this.containerHeight() - h),
        w,
        h,
      },
    };
  }

  #resize(
    origin: CroppableImageValue,
    handle: Handle,
    dx: number,
    dy: number,
    keepRatio: boolean,
  ): CroppableImageValue {
    const { x, y, w, h } = origin.rect;
    const min = this.minSize();
    const fromWest = handle.includes('w');
    const fromNorth = handle.includes('n');
    const horizontal = handle.includes('e') || fromWest;
    const vertical = handle.includes('s') || fromNorth;

    // Room available from the fixed (opposite) edge to the page border.
    const maxW = fromWest ? x + w : this.containerWidth() - x;
    const maxH = fromNorth ? y + h : this.containerHeight() - y;

    let nextW = horizontal ? clamp(w + (fromWest ? -dx : dx), min, maxW) : w;
    let nextH = vertical ? clamp(h + (fromNorth ? -dy : dy), min, maxH) : h;

    if (keepRatio && horizontal && vertical) {
      const ratio = w / h;
      // Follow whichever axis the pointer moved further, proportionally.
      nextW = Math.abs(nextW - w) / w >= Math.abs(nextH - h) / h ? nextW : nextH * ratio;
      nextW = clamp(nextW, Math.max(min, min * ratio), Math.min(maxW, maxH * ratio));
      nextH = nextW / ratio;
    }

    return {
      crop: origin.crop,
      rect: {
        x: fromWest ? x + w - nextW : x,
        y: fromNorth ? y + h - nextH : y,
        w: nextW,
        h: nextH,
      },
    };
  }

  /** Crop mode: moving an edge trims/restores that side while the full image
   * stays put — its on-page scale and position don't change. */
  #cropEdges(origin: CroppableImageValue, handle: Handle, dx: number, dy: number): CroppableImageValue {
    const full = fullImageRect(origin);
    const fullX = origin.rect.x + full.x;
    const fullY = origin.rect.y + full.y;
    const minW = Math.max(this.minSize(), full.w * MIN_VISIBLE_FRACTION);
    const minH = Math.max(this.minSize(), full.h * MIN_VISIBLE_FRACTION);

    let left = origin.rect.x;
    let right = origin.rect.x + origin.rect.w;
    let top = origin.rect.y;
    let bottom = origin.rect.y + origin.rect.h;

    if (handle.includes('w')) left = clamp(left + dx, fullX, right - minW);
    if (handle.includes('e')) right = clamp(right + dx, left + minW, fullX + full.w);
    if (handle.includes('n')) top = clamp(top + dy, fullY, bottom - minH);
    if (handle.includes('s')) bottom = clamp(bottom + dy, top + minH, fullY + full.h);

    return {
      rect: { x: left, y: top, w: right - left, h: bottom - top },
      crop: {
        left: (left - fullX) / full.w,
        right: (fullX + full.w - right) / full.w,
        top: (top - fullY) / full.h,
        bottom: (fullY + full.h - bottom) / full.h,
      },
    };
  }
}

/** Uncropped image size, and its offset relative to the frame's top-left. */
function fullImageRect({ rect, crop }: CroppableImageValue): ImageFrameRect {
  const w = rect.w / (1 - crop.left - crop.right);
  const h = rect.h / (1 - crop.top - crop.bottom);
  return { x: -crop.left * w, y: -crop.top * h, w, h };
}

/** Crop mode body drag: slides the image under the fixed frame. */
function panCrop(origin: CroppableImageValue, dx: number, dy: number): CroppableImageValue {
  const full = fullImageRect(origin);
  const { left, right, top, bottom } = origin.crop;
  const nextLeft = clamp(left - dx / full.w, 0, left + right);
  const nextTop = clamp(top - dy / full.h, 0, top + bottom);
  return {
    rect: origin.rect,
    crop: {
      left: nextLeft,
      right: left + right - nextLeft,
      top: nextTop,
      bottom: top + bottom - nextTop,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
