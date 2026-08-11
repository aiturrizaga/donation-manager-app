import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Editor } from 'primeng/editor';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { LegalPage } from '@domain/legal-page';
import { LegalPageApi } from '@shared/api/legal-page.api';
import { LegalPageEditForm } from '../../legal-page.forms';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';

@Component({
  selector: 'app-legal-page-detail-page',
  imports: [ReactiveFormsModule, InputText, Editor, Button, Message, Tag, ToggleSwitch],
  templateUrl: './legal-page-detail.html',
})
export class LegalPageDetailPage {
  readonly #router = inject(Router);
  readonly #fb = inject(FormBuilder);
  readonly #api = inject(LegalPageApi);

  readonly legalPage = input.required<LegalPage>();

  protected readonly saveOp = operationState();

  readonly orgName = computed(
    () => this.legalPage().organization?.tradeName ?? this.legalPage().organization?.legalName ?? '—',
  );

  readonly typeLabel = computed(() => {
    const type = this.legalPage().legalType;
    if (type === 'privacy_policy') return 'Política de privacidad';
    if (type === 'terms_of_service') return 'Términos de uso';
    return 'Personalizada';
  });

  readonly form: FormGroup<LegalPageEditForm> = this.#fb.group({
    title: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    slug: this.#fb.control('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      ],
    }),
    content: this.#fb.control('', { nonNullable: true }),
    isActive: this.#fb.control(true, { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  constructor() {
    // input.required() no tiene valor garantizado en el cuerpo síncrono del
    // constructor — se lee desde un effect(), igual que RoleEditPage.
    effect(() => {
      const page = this.legalPage();
      this.form.patchValue({
        title: page.title,
        slug: page.slug,
        content: page.content,
        isActive: page.isActive,
      });
      if (page.isMandatory) {
        this.form.controls.slug.disable();
      } else {
        this.form.controls.slug.enable();
      }
    });
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.saveOp
      .run(this.#api.update(this.legalPage().id, this.form.getRawValue()), 'Página legal actualizada.')
      .subscribe();
  }

  goBack(): void {
    this.#router.navigate(['/legal-pages']);
  }
}
