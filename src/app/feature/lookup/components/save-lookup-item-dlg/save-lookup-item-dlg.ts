import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LookupApi } from '@shared/api/lookup.api';
import { LookupItem } from '@domain/lookup';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

interface SaveLookupItemForm {
  value: FormControl<string>;
  label: FormControl<string>;
  sortOrder: FormControl<number>;
}

/** Crea o edita un ítem dentro de un catálogo (Lookup) ya existente. */
@Component({
  selector: 'app-save-lookup-item-dlg',
  imports: [ReactiveFormsModule, InputText, InputNumber, Button, Message],
  templateUrl: './save-lookup-item-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveLookupItemDlg implements OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogConfig = inject(DynamicDialogConfig);
  readonly #fb = inject(FormBuilder);
  readonly #lookupApi = inject(LookupApi);

  readonly #lookupId: number = this.#dialogConfig.data.lookupId;
  readonly #existingItem: LookupItem | undefined = this.#dialogConfig.data?.item;

  protected readonly saveOp = operationState();

  readonly form: FormGroup<SaveLookupItemForm> = this.#fb.group({
    value: this.#fb.control(this.#existingItem?.value ?? '', {
      validators: [Validators.required, Validators.maxLength(50)],
      nonNullable: true,
    }),
    label: this.#fb.control(this.#existingItem?.label ?? '', {
      validators: [Validators.required, Validators.maxLength(150)],
      nonNullable: true,
    }),
    sortOrder: this.#fb.control(this.#existingItem?.sortOrder ?? 0, {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  readonly formValidator = new FormValidator(this.form);

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const raw = this.form.getRawValue();
    const call$ = this.#existingItem
      ? this.#lookupApi.updateItem(this.#lookupId, this.#existingItem.id, raw)
      : this.#lookupApi.createItem(this.#lookupId, raw);

    const successMessage = this.#existingItem ? 'Ítem actualizado.' : 'Ítem creado.';
    this.saveOp.run(call$, successMessage).subscribe({
      next: (item) => this.#dialogRef.close(item),
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
