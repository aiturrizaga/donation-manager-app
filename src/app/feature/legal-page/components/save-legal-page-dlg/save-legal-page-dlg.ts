import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Editor } from 'primeng/editor';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LegalPageApi } from '@shared/api/legal-page.api';
import { LegalPageCreateForm } from '../../legal-page.forms';
import { Organization } from '@domain/organization';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

@Component({
  selector: 'app-save-legal-page-dlg',
  imports: [ReactiveFormsModule, InputText, Editor, Button, Message, Select],
  templateUrl: './save-legal-page-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveLegalPageDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogService = inject(DialogService);
  readonly #fb = inject(FormBuilder);
  readonly #api = inject(LegalPageApi);
  readonly #router = inject(Router);

  protected readonly saveOp = operationState();
  readonly organizations = signal<Organization[]>([]);

  readonly form: FormGroup<LegalPageCreateForm> = this.#fb.group({
    organizationId: this.#fb.control<number | null>(null, Validators.required),
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

  ngOnInit(): void {
    const instance = this.#dialogService.getInstance(this.#dialogRef);
    if (instance?.data?.organizations) {
      this.organizations.set(instance.data.organizations);
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const value = this.form.getRawValue();
    const payload = { ...value, organizationId: value.organizationId! };

    this.saveOp.run(this.#api.create(payload), 'Página legal creada.').subscribe({
      next: (page) => {
        this.#dialogRef.close(page);
        this.#router.navigate(['/legal-pages', page.id]).then();
      },
      error: (err: AppError) => {
        if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
      },
    });
  }

  close(): void {
    this.#dialogRef.close();
  }

  ngOnDestroy(): void {
    this.#dialogRef?.close();
  }
}
