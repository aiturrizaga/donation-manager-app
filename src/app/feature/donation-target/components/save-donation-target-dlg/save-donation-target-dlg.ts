import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
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
import { DonationTargetApi } from '../../api/donation-target.api';
import { DonationTarget, DonationTargetForm } from '../../models/donation-target.model';
import { FormValidator } from '@shared/utils/form-validator.util';
import { Organization } from '../../../organization/models/organization.model';

const TYPE_OPTIONS = [
  { label: 'Causa', value: 'cause' },
  { label: 'Grupo', value: 'group' },
  { label: 'Campaña', value: 'campaign' },
  { label: 'Meta', value: 'goal' },
];

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
})
export class SaveDonationTargetDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogService = inject(DialogService);
  readonly #fb = inject(FormBuilder);
  readonly #api = inject(DonationTargetApi);

  readonly isSaving = signal(false);
  readonly typeOptions = TYPE_OPTIONS;

  readonly organizations = signal<Organization[]>([]);
  readonly target = signal<DonationTarget | null>(null);

  readonly form: FormGroup<DonationTargetForm> = this.#fb.group({
    organizationId: this.#fb.control<number | null>(null, {
      validators: [Validators.required],
    }),
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
    if (instance?.data?.organizations) {
      this.organizations.set(instance.data.organizations);
    }
    if (instance?.data?.target) {
      const t: DonationTarget = instance.data.target;
      this.target.set(t);
      this.form.patchValue({
        organizationId: t.organizationId,
        targetType: t.targetType,
        name: t.name,
        description: t.description,
        amountGoal: t.amountGoal,
        startsAt: t.startsAt ? new Date(t.startsAt) : null,
        endsAt: t.endsAt ? new Date(t.endsAt) : null,
        isPublic: t.isPublic,
      });
      this.form.controls.organizationId.disable();
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const orgId = raw.organizationId!;

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
      ? this.#api.update(orgId, target.id, payload)
      : this.#api.create(orgId, payload);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (result) => this.#dialogRef.close(result),
      error: (err) => console.error('[SaveDonationTargetDlg]', err),
    });
  }

  close(): void {
    this.#dialogRef.close();
  }

  ngOnDestroy(): void {
    this.#dialogRef?.close();
  }
}
