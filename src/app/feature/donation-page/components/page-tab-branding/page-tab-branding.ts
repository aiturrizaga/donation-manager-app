import { ChangeDetectionStrategy, Component, inject, input, output, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Editor } from 'primeng/editor';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ConfirmationService } from 'primeng/api';
import { DonationPage, PageBranding } from '@domain/donation-page';
import { PageBrandingForm } from '../../donation-page.forms';
import { DonationPageApi } from '../../api/donation-page.api';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';
import { ImageUpload } from '@shared/ui/image-upload/image-upload';
import { environment } from '@env/environment';

const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

@Component({
  selector: 'app-page-tab-branding',
  imports: [ReactiveFormsModule, InputText, Editor, Button, Message, ImageUpload],
  templateUrl: './page-tab-branding.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTabBranding implements OnInit {
  readonly page = input.required<DonationPage>();
  readonly saved = output<void>();

  readonly #api = inject(DonationPageApi);
  readonly #fb = inject(FormBuilder);
  readonly #confirm = inject(ConfirmationService);

  protected readonly saveOp = operationState();
  protected readonly logoUploadOp = operationState();
  protected readonly heroUploadOp = operationState();
  protected readonly faviconUploadOp = operationState();
  protected readonly logoRemoveOp = operationState();
  protected readonly heroRemoveOp = operationState();
  protected readonly faviconRemoveOp = operationState();
  readonly hasExisting = signal(false);
  readonly logoUrl = signal<string | null>(null);
  readonly heroImageUrl = signal<string | null>(null);
  readonly faviconUrl = signal<string | null>(null);

  readonly form: FormGroup<PageBrandingForm> = this.#fb.group({
    companyName: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    primaryColor: this.#fb.control('#0056A0', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(COLOR_PATTERN)],
    }),
    secondaryColor: this.#fb.control<string | null>(null, {
      validators: [Validators.pattern(COLOR_PATTERN)],
    }),
    heroHeading: this.#fb.control<string | null>(null),
    welcomeText: this.#fb.control<string | null>(null),
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    const branding = this.page().branding;
    if (branding) {
      this.hasExisting.set(true);
      this.form.patchValue(branding);
      this.#applyBranding(branding);
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const raw = this.form.getRawValue();
    const pageId = this.page().id;

    const request$ = this.hasExisting()
      ? this.#api.updateBranding(pageId, raw)
      : this.#api.createBranding(pageId, raw);
    const successMessage = this.hasExisting() ? 'Apariencia actualizada.' : 'Apariencia creada.';

    this.saveOp.run(request$, successMessage).subscribe({
      next: (branding) => {
        this.hasExisting.set(true);
        this.#applyBranding(branding);
        this.saved.emit();
      },
      error: (err: AppError) => {
        if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
      },
    });
  }

  uploadLogo(file: File): void {
    this.logoUploadOp
      .run(this.#api.uploadBrandingLogo(this.page().id, file), 'Logo actualizado.')
      .subscribe({
        next: (branding) => this.#applyBranding(branding),
      });
  }

  uploadHero(file: File): void {
    this.heroUploadOp
      .run(this.#api.uploadBrandingHero(this.page().id, file), 'Imagen principal actualizada.')
      .subscribe({
        next: (branding) => this.#applyBranding(branding),
      });
  }

  uploadFavicon(file: File): void {
    this.faviconUploadOp
      .run(this.#api.uploadBrandingFavicon(this.page().id, file), 'Favicon actualizado.')
      .subscribe({
        next: (branding) => this.#applyBranding(branding),
      });
  }

  removeLogo(): void {
    this.#confirmRemove('¿Quitar el logo?', () =>
      this.logoRemoveOp
        .run(this.#api.deleteBrandingLogo(this.page().id), 'Logo eliminado.')
        .subscribe({ next: (branding) => this.#applyBranding(branding) }),
    );
  }

  removeHero(): void {
    this.#confirmRemove('¿Quitar la imagen principal?', () =>
      this.heroRemoveOp
        .run(this.#api.deleteBrandingHero(this.page().id), 'Imagen principal eliminada.')
        .subscribe({ next: (branding) => this.#applyBranding(branding) }),
    );
  }

  removeFavicon(): void {
    this.#confirmRemove('¿Quitar el favicon?', () =>
      this.faviconRemoveOp
        .run(this.#api.deleteBrandingFavicon(this.page().id), 'Favicon eliminado.')
        .subscribe({ next: (branding) => this.#applyBranding(branding) }),
    );
  }

  #confirmRemove(message: string, onConfirm: () => void): void {
    this.#confirm.confirm({
      message: `${message} Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, quitar',
      acceptButtonProps: { severity: 'danger' },
      accept: onConfirm,
    });
  }

  #applyBranding(branding: PageBranding): void {
    this.logoUrl.set(branding.logoUrl ? `${environment.apiUrl}${branding.logoUrl}` : null);
    this.heroImageUrl.set(
      branding.heroImageUrl ? `${environment.apiUrl}${branding.heroImageUrl}` : null,
    );
    this.faviconUrl.set(branding.faviconUrl ? `${environment.apiUrl}${branding.faviconUrl}` : null);
  }
}
