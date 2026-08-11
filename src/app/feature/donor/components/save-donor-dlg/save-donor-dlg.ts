import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Divider } from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DonorApi } from '../../api/donor.api';
import { PartnerApi } from '@shared/api/partner.api';
import { DocumentType, Donor } from '@domain/donor';
import { DonorCreateForm } from '../../donor.forms';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

const DOCUMENT_TYPES = [
  { label: 'DNI — Persona natural', value: 'dni' },
  { label: 'RUC — Empresa', value: 'ruc' },
];

export interface SaveDonorDlgData {
  donor: Donor;
}

@Component({
  selector: 'app-save-donor-dlg',
  imports: [
    ReactiveFormsModule,
    InputText,
    Button,
    Message,
    Select,
    Divider,
    ProgressSpinner,
  ],
  templateUrl: './save-donor-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveDonorDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogConfig = inject(DynamicDialogConfig<SaveDonorDlgData>);
  readonly #fb = inject(FormBuilder);
  readonly #donorApi = inject(DonorApi);
  readonly #partnerApi = inject(PartnerApi);

  protected readonly saveOp = operationState();
  protected readonly loadingPartner = signal(false);
  readonly documentTypes = DOCUMENT_TYPES;

  // Present only when editing an existing donor (see donor-list.ts's
  // openEditDialog / donor-profile.ts's openEditDialog) — absent means this
  // dialog is creating a brand-new donor+partner, same as it always did.
  readonly #editingDonor = this.#dialogConfig.data?.donor ?? null;
  readonly isEditing = computed(() => this.#editingDonor !== null);

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

  ngOnInit(): void {
    if (!this.#editingDonor) return;

    // The list/profile screens only carry a combined `partner.name` — the
    // full first/last/business split (and the rest of the editable fields)
    // only lives on the Partner record itself, so it's fetched fresh here
    // rather than trying to guess a split from the combined name.
    this.loadingPartner.set(true);
    this.#partnerApi.getById(this.#editingDonor.partnerId).subscribe({
      next: (partner) => {
        this.form.patchValue({
          documentType: partner.partnerType === 'company' ? 'ruc' : 'dni',
          documentNumber: partner.documentNumber ?? '',
          firstName: partner.firstName,
          lastName: partner.lastName,
          businessName: partner.businessName ?? '',
          email: partner.email,
          phone: partner.phone,
          address: partner.address,
        });
        // partner_type is read-only after creation (backend: PATCH /v1/partners/{id}
        // docstring) — the donor is always already one or the other by now.
        this.form.controls.documentType.disable();
        this.loadingPartner.set(false);
      },
      error: () => this.loadingPartner.set(false),
    });
  }

  save(): void {
    this._applyDynamicValidators();
    if (this.form.invalid) return this.form.markAllAsTouched();

    const raw = this.form.getRawValue();
    const isIndividual = raw.documentType === 'dni';

    if (this.#editingDonor) {
      this.saveOp
        .run(
          this.#partnerApi.update(this.#editingDonor.partnerId, {
            ...(isIndividual
              ? { firstName: raw.firstName, lastName: raw.lastName }
              : { businessName: raw.businessName }),
            documentNumber: raw.documentNumber,
            email: raw.email,
            phone: raw.phone,
            address: raw.address,
          }),
          'Donante actualizado.',
        )
        .subscribe({
          next: (partner) => this.#dialogRef.close(partner),
          error: (err: AppError) => {
            if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
          },
        });
      return;
    }

    this.saveOp
      .run(
        this.#donorApi.create({
          partnerType: isIndividual ? 'individual' : 'company',
          ...(isIndividual
            ? { firstName: raw.firstName, lastName: raw.lastName }
            : { businessName: raw.businessName }),
          documentNumber: raw.documentNumber,
          email: raw.email,
          phone: raw.phone,
          address: raw.address,
        }),
        'Donante creado.',
      )
      .subscribe({
        next: (donor) => this.#dialogRef.close(donor),
        error: (err: AppError) => {
          if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
        },
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
