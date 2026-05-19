import { Component, inject, OnDestroy, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Divider } from 'primeng/divider';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DonorApi } from '../../api/donor.api';
import { DocumentType, DonorCreateForm } from '../../models/donor.model';
import { FormValidator } from '@shared/utils/form-validator.util';

const DOCUMENT_TYPES = [
  { label: 'DNI — Persona natural', value: 'dni' },
  { label: 'RUC — Empresa', value: 'ruc' },
];

@Component({
  selector: 'app-save-donor-dlg',
  imports: [ReactiveFormsModule, InputText, Button, Message, Select, Divider],
  templateUrl: './save-donor-dlg.html',
})
export class SaveDonorDlg implements OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #fb = inject(FormBuilder);
  readonly #donorApi = inject(DonorApi);

  readonly isSaving = signal(false);
  readonly documentTypes = DOCUMENT_TYPES;

  readonly form: FormGroup<DonorCreateForm> = this.#fb.group({
    documentType: this.#fb.control<DocumentType>('dni', { nonNullable: true }),
    documentNumber: this.#fb.control('', {
      validators: [Validators.required, Validators.maxLength(20)],
      nonNullable: true,
    }),
    firstName: this.#fb.control('', { nonNullable: true }),
    lastName: this.#fb.control('', { nonNullable: true }),
    businessName: this.#fb.control('', { nonNullable: true }),
    email: this.#fb.control<string | null>(null, { validators: [Validators.email] }),
    phone: this.#fb.control<string | null>(null),
    address: this.#fb.control<string | null>(null),
  });

  readonly formValidator = new FormValidator(this.form);

  readonly isIndividual = computed(() => this.form.controls.documentType.value === 'dni');

  save(): void {
    this._applyDynamicValidators();
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const isIndividual = raw.documentType === 'dni';

    this.#donorApi
      .create({
        partnerType: isIndividual ? 'individual' : 'company',
        ...(isIndividual
          ? { firstName: raw.firstName, lastName: raw.lastName }
          : { businessName: raw.businessName }),
        documentNumber: raw.documentNumber,
        email: raw.email,
        phone: raw.phone,
        address: raw.address,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (donor) => this.#dialogRef.close(donor),
        error: (err) => console.error('[SaveDonorDlg]', err),
      });
  }

  private _applyDynamicValidators(): void {
    const isIndividual = this.form.controls.documentType.value === 'dni';
    const { firstName, lastName, businessName } = this.form.controls;

    if (isIndividual) {
      firstName.setValidators([Validators.required, Validators.maxLength(200)]);
      lastName.setValidators([Validators.required, Validators.maxLength(200)]);
      businessName.clearValidators();
    } else {
      businessName.setValidators([Validators.required, Validators.maxLength(150)]);
      firstName.clearValidators();
      lastName.clearValidators();
    }

    firstName.updateValueAndValidity();
    lastName.updateValueAndValidity();
    businessName.updateValueAndValidity();
  }

  close(): void {
    this.#dialogRef.close();
  }

  ngOnDestroy(): void {
    this.#dialogRef?.close();
  }
}
