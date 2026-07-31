import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { Tag } from 'primeng/tag';
import { DonationPage } from '@domain/donation-page';
import { DonationPageGeneralForm } from '../../donation-page.forms';
import { DonationPageApi } from '../../api/donation-page.api';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

@Component({
  selector: 'app-page-tab-general',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputText,
    Textarea,
    Button,
    Message,
    Tag,
  ],
  templateUrl: './page-tab-general.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTabGeneral {
  readonly page = input.required<DonationPage>();
  readonly saved = output<DonationPage>();

  readonly #api = inject(DonationPageApi);
  readonly #fb = inject(FormBuilder);

  protected readonly saveOp = operationState();

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
    domain: this.#fb.control<string | null>(null),
  });

  readonly formValidator = new FormValidator(this.form);

  constructor() {
    effect(() => {
      const p = this.page();
      this.form.patchValue({
        name: p.name,
        slug: p.slug,
        description: p.description,
        domain: p.domain,
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
    const raw = this.form.getRawValue();

    this.saveOp.run(this.#api.update(this.page().id, { ...raw })).subscribe({
      next: (updated) => this.saved.emit(updated),
      error: (err: AppError) => {
        if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
      },
    });
  }
}
