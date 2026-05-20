import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Textarea } from 'primeng/textarea';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaymentGatewayApi } from '../../api/payment-gateway.api';
import { PaymentGateway, PaymentGatewayForm } from '../../models/payment-gateway.model';
import { FormValidator } from '@shared/utils/form-validator.util';

const PROVIDER_OPTIONS = [
  { label: 'Culqi', value: 'culqi' },
  { label: 'Mercado Pago', value: 'mercadopago' },
  { label: 'PayPal', value: 'paypal' },
];

@Component({
  selector: 'app-save-payment-gateway-dlg',
  imports: [ReactiveFormsModule, InputText, Button, Message, Select, ToggleSwitch, Textarea],
  templateUrl: './save-payment-gateway-dlg.html',
})
export class SavePaymentGatewayDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogService = inject(DialogService);
  readonly #fb = inject(FormBuilder);
  readonly #api = inject(PaymentGatewayApi);

  readonly isSaving = signal(false);
  readonly providerOptions = PROVIDER_OPTIONS;

  readonly organizationId = signal<number | null>(null);
  readonly gateway = signal<PaymentGateway | null>(null);

  readonly form: FormGroup<PaymentGatewayForm> = this.#fb.group({
    provider: this.#fb.control('culqi', { nonNullable: true, validators: [Validators.required] }),
    publicKey: this.#fb.control('', { nonNullable: true, validators: [Validators.required] }),
    secretKey: this.#fb.control('', { nonNullable: true, validators: [Validators.required] }),
    webhookSecret: this.#fb.control<string | null>(null),
    rsaId: this.#fb.control<string | null>(null),
    rsaPublicKey: this.#fb.control<string | null>(null),
    isActive: this.#fb.control(false, { nonNullable: true }),
    testMode: this.#fb.control(true, { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    const instance = this.#dialogService.getInstance(this.#dialogRef);
    if (instance?.data?.organizationId) {
      this.organizationId.set(instance.data.organizationId);
    }
    if (instance?.data?.gateway) {
      const gw: PaymentGateway = instance.data.gateway;
      this.gateway.set(gw);
      this.form.patchValue({ provider: gw.provider, isActive: gw.isActive, testMode: gw.testMode });
      // Keys are write-only — don't prefill, require re-entry on update
      this.form.controls.provider.disable();
      this.form.controls.publicKey.clearValidators();
      this.form.controls.secretKey.clearValidators();
      this.form.controls.publicKey.updateValueAndValidity();
      this.form.controls.secretKey.updateValueAndValidity();
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const orgId = this.organizationId();
    if (!orgId) return;

    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const gw = this.gateway();

    const request$ = gw
      ? this.#api.update(orgId, gw.id, {
          publicKey: raw.publicKey || null,
          secretKey: raw.secretKey || null,
          webhookSecret: raw.webhookSecret,
          rsaId: raw.rsaId,
          rsaPublicKey: raw.rsaPublicKey,
          isActive: raw.isActive,
          testMode: raw.testMode,
        })
      : this.#api.create(orgId, {
          provider: raw.provider,
          publicKey: raw.publicKey,
          secretKey: raw.secretKey,
          webhookSecret: raw.webhookSecret,
          rsaId: raw.rsaId,
          rsaPublicKey: raw.rsaPublicKey,
          isActive: raw.isActive,
          testMode: raw.testMode,
        });

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (result) => this.#dialogRef.close(result),
      error: (err) => console.error('[SavePaymentGatewayDlg]', err),
    });
  }

  close(): void {
    this.#dialogRef.close();
  }

  ngOnDestroy(): void {
    this.#dialogRef?.close();
  }
}
