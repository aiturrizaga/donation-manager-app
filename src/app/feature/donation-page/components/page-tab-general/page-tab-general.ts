import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { Tag } from 'primeng/tag';
import { DonationPage, DonationPageGeneralForm } from '../../models/donation-page.model';
import { DonationPageApi } from '../../api/donation-page.api';
import { FormValidator } from '@shared/utils/form-validator.util';

@Component({
  selector: 'app-page-tab-general',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputText,
    Textarea,
    Button,
    Message,
    ToggleSwitch,
    Tag,
  ],
  templateUrl: './page-tab-general.html',
})
export class PageTabGeneral {
  readonly page = input.required<DonationPage>();
  readonly saved = output<DonationPage>();

  readonly #api = inject(DonationPageApi);
  readonly #fb = inject(FormBuilder);

  readonly isSaving = signal(false);

  readonly form: FormGroup<DonationPageGeneralForm> = this.#fb.group({
    name: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    slug: this.#fb.control('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      ],
    }),
    description: this.#fb.control<string | null>(null),
    welcomeText: this.#fb.control<string | null>(null),
    thankYouText: this.#fb.control<string | null>(null),
    domain: this.#fb.control<string | null>(null),
    allowsRecurring: this.#fb.control(false, { nonNullable: true }),
    suggestedAmounts: this.#fb.control<string | null>(null),
  });

  readonly formValidator = new FormValidator(this.form);

  constructor() {
    // patch when page input changes
    import('@angular/core').then(({ effect }) => {
      effect(() => {
        const p = this.page();
        this.form.patchValue({
          name: p.name,
          slug: p.slug,
          description: p.description,
          welcomeText: p.welcomeText,
          thankYouText: p.thankYouText,
          domain: p.domain,
          allowsRecurring: p.allowsRecurring,
          suggestedAmounts: p.suggestedAmounts?.join(', ') ?? null,
        });
      });
    });
  }

  getDomainStatusSeverity(): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      verified: 'success',
      pending: 'warn',
      error: 'danger',
    };
    return map[this.page().domainStatus] ?? 'secondary';
  }

  getDomainStatusLabel(): string {
    const map: Record<string, string> = {
      verified: 'Verificado',
      pending: 'Pendiente',
      error: 'Error',
    };
    return map[this.page().domainStatus] ?? this.page().domainStatus;
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    const suggestedAmounts = raw.suggestedAmounts
      ? raw.suggestedAmounts
          .split(',')
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v))
      : null;

    this.#api
      .update(this.page().id, { ...raw, suggestedAmounts })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updated) => this.saved.emit(updated),
        error: (err) => console.error('[PageTabGeneral]', err),
      });
  }
}
