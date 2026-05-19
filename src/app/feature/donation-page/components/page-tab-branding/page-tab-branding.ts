import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DonationPage, PageBrandingForm } from '../../models/donation-page.model';
import { DonationPageApi } from '../../api/donation-page.api';
import { FormValidator } from '@shared/utils/form-validator.util';

const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

@Component({
  selector: 'app-page-tab-branding',
  imports: [ReactiveFormsModule, InputText, Button, Message],
  templateUrl: './page-tab-branding.html',
})
export class PageTabBranding implements OnInit {
  readonly page = input.required<DonationPage>();
  readonly saved = output<void>();

  readonly #api = inject(DonationPageApi);
  readonly #fb = inject(FormBuilder);

  readonly isSaving = signal(false);
  readonly hasExisting = signal(false);

  readonly form: FormGroup<PageBrandingForm> = this.#fb.group({
    companyName: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    logoUrl: this.#fb.control<string | null>(null),
    heroImageUrl: this.#fb.control<string | null>(null),
    faviconUrl: this.#fb.control<string | null>(null),
    primaryColor: this.#fb.control('#0056A0', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(COLOR_PATTERN)],
    }),
    secondaryColor: this.#fb.control<string | null>(null, {
      validators: [Validators.pattern(COLOR_PATTERN)],
    }),
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    const branding = this.page().branding;
    if (branding) {
      this.hasExisting.set(true);
      this.form.patchValue(branding);
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const pageId = this.page().id;

    const request$ = this.hasExisting()
      ? this.#api.updateBranding(pageId, raw)
      : this.#api.createBranding(pageId, raw);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.hasExisting.set(true);
        this.saved.emit();
      },
      error: (err) => console.error('[PageTabBranding]', err),
    });
  }
}
