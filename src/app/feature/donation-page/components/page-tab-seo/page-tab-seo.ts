import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ConfirmationService } from 'primeng/api';
import { DonationPage, PageSeo } from '@domain/donation-page';
import { PageSeoForm } from '../../donation-page.forms';
import { DonationPageApi } from '../../api/donation-page.api';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';
import { ImageUpload } from '@shared/ui/image-upload/image-upload';
import { environment } from '@env/environment';

// Límites recomendados: Google corta el título ~60 caracteres y la
// descripción ~155; las redes muestran algo similar en el preview.
const TITLE_MAX = 70;
const DESCRIPTION_MAX = 200;
const TITLE_RECOMMENDED = 60;
const DESCRIPTION_RECOMMENDED = 155;
// Facebook/WhatsApp/X no muestran SVG en el preview.
const OG_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Pestaña "SEO": título, descripción e imagen que ven los buscadores y la
 * vista previa al compartir el link de la página (Facebook, WhatsApp, X).
 * Los campos vacíos usan los mismos respaldos que el portal (nombre de la
 * página, texto de bienvenida, imagen hero o logo), y el preview los refleja.
 */
@Component({
  selector: 'app-page-tab-seo',
  imports: [ReactiveFormsModule, InputText, Textarea, ToggleSwitch, Button, Message, ImageUpload],
  templateUrl: './page-tab-seo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTabSeo implements OnInit {
  readonly page = input.required<DonationPage>();

  readonly #api = inject(DonationPageApi);
  readonly #fb = inject(FormBuilder);
  readonly #confirm = inject(ConfirmationService);

  protected readonly saveOp = operationState();
  protected readonly imageUploadOp = operationState();
  protected readonly imageRemoveOp = operationState();
  protected readonly ogImageUrl = signal<string | null>(null);

  protected readonly titleMax = TITLE_MAX;
  protected readonly descriptionMax = DESCRIPTION_MAX;
  protected readonly titleRecommended = TITLE_RECOMMENDED;
  protected readonly descriptionRecommended = DESCRIPTION_RECOMMENDED;
  protected readonly ogImageTypes = OG_IMAGE_TYPES;

  readonly form: FormGroup<PageSeoForm> = this.#fb.group({
    metaTitle: this.#fb.control<string | null>(null, [Validators.maxLength(TITLE_MAX)]),
    metaDescription: this.#fb.control<string | null>(null, [Validators.maxLength(DESCRIPTION_MAX)]),
    noIndex: this.#fb.control(false, { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  readonly #values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly titleLength = computed(() => (this.#values().metaTitle ?? '').length);
  protected readonly descriptionLength = computed(
    () => (this.#values().metaDescription ?? '').length,
  );

  // ── Vista previa (mismos respaldos que aplica el portal) ────────────────
  protected readonly previewTitle = computed(
    () => this.#values().metaTitle?.trim() || this.page().name,
  );
  protected readonly previewDescription = computed(
    () =>
      this.#values().metaDescription?.trim() ||
      htmlToText(this.page().branding?.welcomeText) ||
      `Dona a ${this.#organizationName()} de forma segura.`,
  );
  protected readonly previewImage = computed(() => {
    const branding = this.page().branding;
    const fallback = branding?.heroImageUrl ?? branding?.logoUrl ?? null;
    return this.ogImageUrl() ?? (fallback ? `${environment.apiUrl}${fallback}` : null);
  });
  protected readonly previewHost = computed(() => this.page().domain ?? 'tu-dominio.org');

  ngOnInit(): void {
    const seo = this.page().seo;
    if (seo) {
      this.form.patchValue({
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        noIndex: seo.noIndex,
      });
      this.#applySeo(seo);
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const raw = this.form.getRawValue();
    const payload = {
      metaTitle: raw.metaTitle?.trim() || null,
      metaDescription: raw.metaDescription?.trim() || null,
      noIndex: raw.noIndex,
    };
    this.saveOp.run(this.#api.upsertSeo(this.page().id, payload), 'SEO actualizado.').subscribe({
      next: (seo) => this.#applySeo(seo),
      error: (err: AppError) => {
        if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
      },
    });
  }

  uploadImage(file: File): void {
    this.imageUploadOp
      .run(this.#api.uploadSeoImage(this.page().id, file), 'Imagen para compartir actualizada.')
      .subscribe({ next: (seo) => this.#applySeo(seo) });
  }

  removeImage(): void {
    this.#confirm.confirm({
      message: '¿Quitar la imagen para compartir? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, quitar',
      acceptButtonProps: { severity: 'danger' },
      accept: () =>
        this.imageRemoveOp
          .run(this.#api.deleteSeoImage(this.page().id), 'Imagen para compartir eliminada.')
          .subscribe({ next: (seo) => this.#applySeo(seo) }),
    });
  }

  #organizationName(): string {
    const org = this.page().organization;
    return org?.tradeName || org?.legalName || this.page().name;
  }

  #applySeo(seo: PageSeo): void {
    this.ogImageUrl.set(seo.ogImageUrl ? `${environment.apiUrl}${seo.ogImageUrl}` : null);
  }
}

/** Texto plano del HTML del editor (texto de bienvenida), para la descripción. */
function htmlToText(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<\/(p|div|h\d|li)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_RECOMMENDED);
}
