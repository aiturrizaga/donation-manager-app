import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Organization } from '@domain/organization';
import { OrganizationGeneralFormFields } from '../../organization.forms';
import { OrganizationApi } from '@shared/api/organization.api';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';
import { ImageUpload } from '@shared/ui/image-upload/image-upload';
import { environment } from '@env/environment';

/**
 * Formulario de edición de una organización existente — vive en la vista de
 * detalle (OrganizationDetail). La creación de una organización nueva sigue
 * siendo un modal (SaveOrganizationDlg), ya que una organización recién
 * creada aún no tiene una vista de detalle a la que navegar, ni datos de
 * certificado que llenar todavía.
 */
@Component({
  selector: 'app-organization-general-form',
  imports: [ReactiveFormsModule, InputText, Textarea, Button, Message, ImageUpload],
  templateUrl: './organization-general-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationGeneralForm {
  readonly organization = input.required<Organization>();
  readonly saved = output<Organization>();

  readonly #api = inject(OrganizationApi);
  readonly #fb = inject(FormBuilder);

  protected readonly saveOp = operationState();
  protected readonly logoUploadOp = operationState();
  protected readonly sealUploadOp = operationState();
  protected readonly signatureUploadOp = operationState();
  readonly logoUrl = signal<string | null>(null);
  readonly sealUrl = signal<string | null>(null);
  readonly signatureUrl = signal<string | null>(null);

  readonly form: FormGroup<OrganizationGeneralFormFields> = this.#fb.group({
    legalName: this.#fb.control('', { validators: [Validators.required], nonNullable: true }),
    tradeName: this.#fb.control<string | null>(null),
    ruc: this.#fb.control('', {
      validators: [Validators.required, Validators.pattern(/^\d{11}$/)],
      nonNullable: true,
    }),
    legalAddress: this.#fb.control<string | null>(null),
    email: this.#fb.control<string | null>(null, { validators: [Validators.email] }),
    phone: this.#fb.control<string | null>(null),
    mobilePhone: this.#fb.control<string | null>(null),
    // Datos que alimentan el texto del certificado de donación — ver
    // app/core/certificate/organization_data.py (backend). Sin estos cuatro,
    // la generación del certificado falla en vez de usar datos de otra
    // organización o quedar en blanco.
    legalRepresentativeName: this.#fb.control<string | null>(null),
    legalRepresentativeTitle: this.#fb.control<string | null>(null),
    donationResolutionNumber: this.#fb.control<string | null>(null),
    donationResolutionDate: this.#fb.control<string | null>(null),
  });

  readonly formValidator = new FormValidator(this.form);

  constructor() {
    effect(() => {
      const org = this.organization();
      this.form.patchValue(org);
      this.logoUrl.set(org.logoPath ? `${environment.apiUrl}${org.logoPath}` : null);
      this.sealUrl.set(org.sealPath ? `${environment.apiUrl}${org.sealPath}` : null);
      this.signatureUrl.set(org.signaturePath ? `${environment.apiUrl}${org.signaturePath}` : null);
    });
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.saveOp
      .run(this.#api.update(this.organization().id, this.form.getRawValue()), 'Organización actualizada.')
      .subscribe({
        next: (organization) => this.saved.emit(organization),
        error: (err: AppError) => {
          if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
        },
      });
  }

  uploadLogo(file: File): void {
    this.logoUploadOp
      .run(this.#api.uploadLogo(this.organization().id, file), 'Logo actualizado.')
      .subscribe({
        next: (organization) => this.saved.emit(organization),
      });
  }

  uploadSeal(file: File): void {
    this.sealUploadOp
      .run(this.#api.uploadSeal(this.organization().id, file), 'Sello actualizado.')
      .subscribe({
        next: (organization) => this.saved.emit(organization),
      });
  }

  uploadSignature(file: File): void {
    this.signatureUploadOp
      .run(this.#api.uploadSignature(this.organization().id, file), 'Firma actualizada.')
      .subscribe({
        next: (organization) => this.saved.emit(organization),
      });
  }
}
