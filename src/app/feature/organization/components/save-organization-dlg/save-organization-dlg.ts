import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrganizationForm } from '../../organization.forms';
import { OrganizationApi } from '@shared/api/organization.api';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

/**
 * Crea una organización nueva. Editar una ya existente se hace en su propia
 * vista de detalle (OrganizationDetail) — una organización recién creada
 * aún no tiene logo que subir ni datos adicionales que ver, así que un
 * modal simple sigue teniendo sentido solo para este caso.
 */
@Component({
  selector: 'app-save-organization-dlg',
  imports: [ReactiveFormsModule, InputText, Button, Message],
  templateUrl: './save-organization-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveOrganizationDlg implements OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #fb = inject(FormBuilder);
  readonly #organizationApi = inject(OrganizationApi);

  protected readonly saveOp = operationState();

  readonly form: FormGroup<OrganizationForm> = this.#fb.group({
    legalName: this.#fb.control('', { validators: [Validators.required], nonNullable: true }),
    tradeName: this.#fb.control<string | null>(null),
    ruc: this.#fb.control('', {
      validators: [Validators.required, Validators.pattern(/^\d{11}$/)],
      nonNullable: true,
    }),
    email: this.#fb.control<string | null>(null, { validators: [Validators.email] }),
    phone: this.#fb.control<string | null>(null),
  });

  readonly formValidator = new FormValidator(this.form);

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.saveOp.run(this.#organizationApi.create(this.form.getRawValue())).subscribe({
      next: (organization) => this.#dialogRef.close(organization),
      error: (err: AppError) => {
        if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
      },
    });
  }

  close(): void {
    this.#dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.#dialogRef) {
      this.#dialogRef.close();
    }
  }
}
