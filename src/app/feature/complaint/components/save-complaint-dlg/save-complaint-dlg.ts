import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ComplaintApi } from '@shared/api/complaint.api';
import { Organization } from '@domain/organization';
import { ComplaintGoodType, ComplaintRecordType } from '@domain/complaint';
import { ComplaintCreateForm } from '../../complaint.forms';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

const RECORD_TYPE_OPTIONS = [
  { label: 'Reclamo', value: 'reclamo' },
  { label: 'Queja', value: 'queja' },
];

const GOOD_TYPE_OPTIONS = [
  { label: 'Producto', value: 'producto' },
  { label: 'Servicio', value: 'servicio' },
];

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'DNI', value: 'dni' },
  { label: 'Carné de extranjería', value: 'ce' },
  { label: 'Pasaporte', value: 'pasaporte' },
];

@Component({
  selector: 'app-save-complaint-dlg',
  imports: [
    ReactiveFormsModule,
    InputText,
    InputNumber,
    Textarea,
    Checkbox,
    Button,
    Message,
    Select,
  ],
  templateUrl: './save-complaint-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveComplaintDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogService = inject(DialogService);
  readonly #fb = inject(FormBuilder);
  readonly #api = inject(ComplaintApi);
  readonly #router = inject(Router);

  protected readonly saveOp = operationState();
  readonly organizations = signal<Organization[]>([]);

  readonly recordTypeOptions = RECORD_TYPE_OPTIONS;
  readonly goodTypeOptions = GOOD_TYPE_OPTIONS;
  readonly documentTypeOptions = DOCUMENT_TYPE_OPTIONS;

  readonly form: FormGroup<ComplaintCreateForm> = this.#fb.group({
    organizationId: this.#fb.control<number | null>(null, Validators.required),
    recordType: this.#fb.control<ComplaintRecordType>('reclamo', {
      nonNullable: true,
      validators: Validators.required,
    }),
    goodType: this.#fb.control<ComplaintGoodType>('producto', {
      nonNullable: true,
      validators: Validators.required,
    }),
    fullName: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    documentType: this.#fb.control('dni', { nonNullable: true, validators: Validators.required }),
    documentNumber: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    email: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(255)],
    }),
    phone: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    address: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    isMinor: this.#fb.control(false, { nonNullable: true }),
    guardianName: this.#fb.control<string | null>(null),
    amount: this.#fb.control<number | null>(null),
    detail: this.#fb.control('', { nonNullable: true, validators: Validators.required }),
    request: this.#fb.control('', { nonNullable: true, validators: Validators.required }),
    dataConsent: this.#fb.control(false, { nonNullable: true, validators: Validators.requiredTrue }),
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

    // organizationId es requerido por Validators.required — el form.invalid
    // guard de arriba garantiza que no es null en este punto.
    const payload = { ...this.form.getRawValue(), organizationId: this.form.getRawValue().organizationId! };

    this.saveOp.run(this.#api.create(payload), 'Reclamo creado.').subscribe({
      next: (complaint) => {
        this.#dialogRef.close(complaint);
        this.#router.navigate(['/complaints', complaint.id]).then();
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
