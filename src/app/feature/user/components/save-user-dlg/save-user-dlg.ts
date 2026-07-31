import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserApi } from '../../api/user.api';
import { UserCreateForm } from '../../user.forms';
import { RbacApi } from '@shared/api/rbac.api';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

@Component({
  selector: 'app-save-user-dlg',
  imports: [ReactiveFormsModule, InputText, Button, Message, Select],
  templateUrl: './save-user-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveUserDlg implements OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #fb = inject(FormBuilder);
  readonly #userApi = inject(UserApi);
  readonly #rbacApi = inject(RbacApi);

  protected readonly saveOp = operationState();
  readonly roles = toSignal(this.#rbacApi.getRoles(), { initialValue: [] });

  readonly form: FormGroup<UserCreateForm> = this.#fb.group({
    firstName: this.#fb.control('', {
      validators: [Validators.required, Validators.maxLength(200)],
      nonNullable: true,
    }),
    lastName: this.#fb.control('', {
      validators: [Validators.required, Validators.maxLength(200)],
      nonNullable: true,
    }),
    email: this.#fb.control('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(255)],
      nonNullable: true,
    }),
    phone: this.#fb.control<string | null>(null),
    documentNumber: this.#fb.control<string | null>(null),
    roleId: this.#fb.control<number | null>(null, { validators: [Validators.required] }),
  });

  readonly formValidator = new FormValidator(this.form);

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const raw = this.form.getRawValue();
    if (raw.roleId === null) return;

    this.saveOp
      .run(
        this.#userApi.create({
          partnerType: 'individual',
          firstName: raw.firstName,
          lastName: raw.lastName,
          email: raw.email,
          phone: raw.phone,
          documentNumber: raw.documentNumber,
          roleId: raw.roleId,
        }),
      )
      .subscribe({
        next: (res) => {
          if (res) this.#dialogRef.close(res);
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
