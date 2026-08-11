import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DonationPageApi } from '../../api/donation-page.api';
import { Organization } from '@domain/organization';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

@Component({
  selector: 'app-create-donation-page-dlg',
  imports: [ReactiveFormsModule, InputText, Button, Message, Select],
  templateUrl: './create-donation-page-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDonationPageDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogService = inject(DialogService);
  readonly #fb = inject(FormBuilder);
  readonly #api = inject(DonationPageApi);
  readonly #router = inject(Router);

  protected readonly saveOp = operationState();
  readonly organizations = signal<Organization[]>([]);

  readonly form: FormGroup = this.#fb.group({
    organizationId: [null, Validators.required],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      ],
    ],
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

    this.saveOp
      .run(this.#api.create(this.form.getRawValue()), 'Página de donación creada.')
      .subscribe({
      next: (page) => {
        this.#dialogRef.close(page);
        this.#router.navigate(['/pages', page.id]).then();
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
