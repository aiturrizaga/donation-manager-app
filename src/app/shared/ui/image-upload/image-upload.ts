import { ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * File picker + preview for images stored through the backend storage gateway.
 * Client-side validation mirrors the backend's own limits (PNG/JPEG/WEBP/SVG,
 * 5 MB) so the user gets instant feedback instead of a round trip.
 */
@Component({
  selector: 'app-image-upload',
  imports: [Button, Message],
  templateUrl: './image-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUpload {
  readonly label = input('Imagen');
  readonly imageUrl = input<string | null>(null);
  readonly disabled = input(false);
  readonly disabledHint = input<string | null>(null);
  readonly loading = input(false);
  readonly removing = input(false);

  readonly fileSelected = output<File>();
  readonly removeRequested = output<void>();

  private readonly fileInputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly validationError = signal<string | null>(null);

  readonly accept = ALLOWED_TYPES.join(',');

  pickFile(): void {
    this.fileInputRef().nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.validationError.set('Formato no soportado. Usa PNG, JPEG, WEBP o SVG.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      this.validationError.set('La imagen supera el límite de 5 MB.');
      return;
    }

    this.validationError.set(null);
    this.fileSelected.emit(file);
  }
}
