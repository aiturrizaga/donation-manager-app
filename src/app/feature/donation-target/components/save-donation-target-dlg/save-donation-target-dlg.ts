import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { InputNumber } from 'primeng/inputnumber';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormsModule } from '@angular/forms';
import { DonationTargetApi } from '@shared/api/donation-target.api';
import { DonationTarget } from '@domain/donation-target';
import { DonationTargetForm } from '../../donation-target.forms';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';
import { TARGET_TYPE_OPTIONS } from '@shared/utils/target-type.util';

/**
 * `organizationId` ya no se elige aquí: la organización sale de la
 * selección global (`SelectedOrganizationContext`) — el diálogo solo se
 * puede abrir con una ya elegida (ver DonationTargetListPage), así que no
 * tiene sentido dejar que el usuario cree un objetivo para otra distinta a
 * la que está viendo.
 */
@Component({
  selector: 'app-save-donation-target-dlg',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputText,
    Textarea,
    Button,
    Message,
    Select,
    DatePicker,
    ToggleSwitch,
    InputNumber,
  ],
  templateUrl: './save-donation-target-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveDonationTargetDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogService = inject(DialogService);
  readonly #fb = inject(FormBuilder);
  readonly #api = inject(DonationTargetApi);

  protected readonly saveOp = operationState();
  readonly typeOptions = TARGET_TYPE_OPTIONS;

  readonly target = signal<DonationTarget | null>(null);
  #organizationId = 0;

  readonly form: FormGroup<DonationTargetForm> = this.#fb.group({
    targetType: this.#fb.control('cause', { nonNullable: true, validators: [Validators.required] }),
    name: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    description: this.#fb.control<string | null>(null),
    amountGoal: this.#fb.control<number | null>(null),
    startsAt: this.#fb.control<Date | null>(null),
    endsAt: this.#fb.control<Date | null>(null),
    isPublic: this.#fb.control(true, { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    const instance = this.#dialogService.getInstance(this.#dialogRef);
    this.#organizationId = instance?.data?.organizationId ?? 0;

    if (instance?.data?.target) {
      const t: DonationTarget = instance.data.target;
      this.target.set(t);
      this.form.patchValue({
        targetType: t.targetType,
        name: t.name,
        description: t.description,
        amountGoal: t.amountGoal,
        startsAt: t.startsAt ? new Date(t.startsAt) : null,
        endsAt: t.endsAt ? new Date(t.endsAt) : null,
        isPublic: t.isPublic,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const raw = this.form.getRawValue();

    const payload = {
      targetType: raw.targetType,
      name: raw.name,
      description: raw.description,
      amountGoal: raw.amountGoal,
      startsAt: raw.startsAt?.toISOString() ?? null,
      endsAt: raw.endsAt?.toISOString() ?? null,
      isPublic: raw.isPublic,
    };

    const target = this.target();
    const request$ = target
      ? this.#api.update(this.#organizationId, target.id, payload)
      : this.#api.create(this.#organizationId, payload);

    const successMessage = target ? 'Objetivo actualizado.' : 'Objetivo creado.';
    this.saveOp.run(request$, successMessage).subscribe({
      next: (result) => this.#dialogRef.close(result),
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
