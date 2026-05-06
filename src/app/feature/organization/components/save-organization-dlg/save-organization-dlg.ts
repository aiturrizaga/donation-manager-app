import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Organization, OrganizationForm } from '../../models/organization.model';
import { OrganizationApi } from '../../api/organization.api';
import { FormValidator } from '@shared/utils/form-validator.util';

@Component({
  selector: 'app-save-organization-dlg',
  imports: [ReactiveFormsModule, InputText, Button, Message],
  templateUrl: './save-organization-dlg.html',
})
export class SaveOrganizationDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #data: Organization | undefined = inject(DialogService).getInstance(this.#dialogRef)
    ?.data;
  readonly #fb = inject(FormBuilder);
  readonly #organizationApi = inject(OrganizationApi);

  readonly isSaving = signal(false);
  readonly organization = signal<Organization | null>(null);

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

  ngOnInit(): void {
    if (this.#data) {
      this.organization.set(this.#data);
      this.form.patchValue(this.#data);
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.isSaving.set(true);
    const orgId = this.organization()?.id;
    const rawValue = this.form.getRawValue();

    const request$ = orgId
      ? this.#organizationApi.update(orgId, rawValue)
      : this.#organizationApi.create(rawValue);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (res) => {
        if (res?.status) this.#dialogRef.close(res.data);
      },
      error: (err) => console.error('[SaveOrganizationDlg]', err),
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
