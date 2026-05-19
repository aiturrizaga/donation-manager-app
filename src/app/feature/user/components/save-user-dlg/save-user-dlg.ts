import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserApi } from '../../api/user.api';
import { UserCreateForm } from '../../models/user.model';
import { FormValidator } from '@shared/utils/form-validator.util';

const ROLE_OPTIONS = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Super Admin', value: 'super_admin' },
];

@Component({
  selector: 'app-save-user-dlg',
  imports: [ReactiveFormsModule, InputText, Button, Message, Select],
  templateUrl: './save-user-dlg.html',
})
export class SaveUserDlg implements OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #fb = inject(FormBuilder);
  readonly #userApi = inject(UserApi);

  readonly isSaving = signal(false);
  readonly roleOptions = ROLE_OPTIONS;

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
    role: this.#fb.control<'super_admin' | 'admin'>('admin', { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    this.#userApi
      .create({
        partnerType: 'individual',
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: raw.email,
        phone: raw.phone,
        documentNumber: raw.documentNumber,
        role: raw.role,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (res) => {
          if (res) this.#dialogRef.close(res);
        },
        error: (err) => console.error('[SaveUserDlg]', err),
      });
  }

  close(): void {
    this.#dialogRef.close();
  }

  ngOnDestroy(): void {
    this.#dialogRef?.close();
  }
}
