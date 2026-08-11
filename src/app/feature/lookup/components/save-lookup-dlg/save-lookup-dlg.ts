import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LookupApi } from '@shared/api/lookup.api';
import { Lookup } from '@domain/lookup';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

interface SaveLookupForm {
  code: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string | null>;
}

/**
 * Crea un catálogo nuevo, o edita nombre/descripción de uno existente — los
 * ítems se administran desde LookupDetailPage. `code` (la clave estable que
 * consume el resto del sistema) es inmutable una vez creado.
 */
@Component({
  selector: 'app-save-lookup-dlg',
  imports: [ReactiveFormsModule, InputText, Textarea, Button, Message],
  templateUrl: './save-lookup-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveLookupDlg implements OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogConfig = inject(DynamicDialogConfig);
  readonly #fb = inject(FormBuilder);
  readonly #lookupApi = inject(LookupApi);

  readonly #existingLookup: Lookup | undefined = this.#dialogConfig.data?.lookup;
  protected readonly isEdit = !!this.#existingLookup;

  protected readonly saveOp = operationState();

  readonly form: FormGroup<SaveLookupForm> = this.#fb.group({
    code: this.#fb.control(this.#existingLookup?.code ?? '', {
      validators: [Validators.required, Validators.pattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)],
      nonNullable: true,
    }),
    name: this.#fb.control(this.#existingLookup?.name ?? '', {
      validators: [Validators.required, Validators.maxLength(150)],
      nonNullable: true,
    }),
    description: this.#fb.control<string | null>(this.#existingLookup?.description ?? null),
  });

  readonly formValidator = new FormValidator(this.form);

  constructor() {
    if (this.isEdit) this.form.controls.code.disable();
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const raw = this.form.getRawValue();
    const call$ = this.#existingLookup
      ? this.#lookupApi.update(this.#existingLookup.id, {
          name: raw.name,
          description: raw.description,
        })
      : this.#lookupApi.create({
          code: raw.code,
          name: raw.name,
          description: raw.description,
        });

    const successMessage = this.#existingLookup ? 'Catálogo actualizado.' : 'Catálogo creado.';
    this.saveOp.run(call$, successMessage).subscribe({
      next: (lookup) => this.#dialogRef.close(lookup),
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
