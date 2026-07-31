import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaymentGatewayApi } from '@shared/api/organization-payment-gateway.api';
import { OrganizationPaymentGateway, PaymentMethod } from '@domain/payment-gateway';
import { OrganizationPaymentGatewayForm } from '../../payment-gateway.forms';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

const PROVIDER_OPTIONS = [
  { label: 'Culqi', value: 'culqi' },
  { label: 'Mercado Pago', value: 'mercadopago' },
  { label: 'PayPal', value: 'paypal' },
];

// Only 'tarjeta' has a verified working backend integration (2026-07-23) —
// the rest just change what Culqi's widget displays. Kept here, not in the
// domain model, since the caveat text is specific to this admin screen.
const PAYMENT_METHOD_OPTIONS: { label: string; value: PaymentMethod; verified: boolean }[] = [
  { label: 'Tarjeta', value: 'tarjeta', verified: true },
  { label: 'Yape', value: 'yape', verified: false },
  { label: 'Billeteras móviles', value: 'billetera', verified: false },
  { label: 'Banca móvil / internet', value: 'bancaMovil', verified: false },
  { label: 'Agentes y bodegas', value: 'agente', verified: false },
  { label: 'Cuotéalo BCP', value: 'cuotealo', verified: false },
];

@Component({
  selector: 'app-save-payment-gateway-dlg',
  imports: [
    ReactiveFormsModule,
    InputText,
    Button,
    Message,
    Select,
    ToggleSwitch,
    Textarea,
    Checkbox,
  ],
  templateUrl: './save-payment-gateway-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavePaymentGatewayDlg implements OnInit, OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogService = inject(DialogService);
  readonly #fb = inject(FormBuilder);
  readonly #api = inject(PaymentGatewayApi);

  protected readonly saveOp = operationState();
  readonly providerOptions = PROVIDER_OPTIONS;
  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  readonly organizationId = signal<number | null>(null);
  readonly gateway = signal<OrganizationPaymentGateway | null>(null);

  readonly form: FormGroup<OrganizationPaymentGatewayForm> = this.#fb.group({
    provider: this.#fb.control('culqi', { nonNullable: true, validators: [Validators.required] }),
    publicKey: this.#fb.control('', { nonNullable: true, validators: [Validators.required] }),
    secretKey: this.#fb.control('', { nonNullable: true, validators: [Validators.required] }),
    webhookUsername: this.#fb.control<string | null>(null),
    webhookSecret: this.#fb.control<string | null>(null),
    rsaId: this.#fb.control<string | null>(null),
    rsaPublicKey: this.#fb.control<string | null>(null),
    isActive: this.#fb.control(false, { nonNullable: true }),
    testMode: this.#fb.control(true, { nonNullable: true }),
    enabledPaymentMethods: this.#fb.control<PaymentMethod[]>(['tarjeta'], { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    const instance = this.#dialogService.getInstance(this.#dialogRef);
    if (instance?.data?.organizationId) {
      this.organizationId.set(instance.data.organizationId);
    }
    if (instance?.data?.gateway) {
      const gw: OrganizationPaymentGateway = instance.data.gateway;
      this.gateway.set(gw);
      this.form.patchValue({
        provider: gw.provider,
        isActive: gw.isActive,
        testMode: gw.testMode,
        enabledPaymentMethods: gw.enabledPaymentMethods,
      });
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

    const raw = this.form.getRawValue();
    const gw = this.gateway();

    const request$ = gw
      ? this.#api.update(orgId, gw.id, {
          publicKey: raw.publicKey || null,
          secretKey: raw.secretKey || null,
          webhookUsername: raw.webhookUsername,
          webhookSecret: raw.webhookSecret,
          rsaId: raw.rsaId,
          rsaPublicKey: raw.rsaPublicKey,
          isActive: raw.isActive,
          testMode: raw.testMode,
          enabledPaymentMethods: raw.enabledPaymentMethods,
        })
      : this.#api.create(orgId, {
          provider: raw.provider,
          publicKey: raw.publicKey,
          secretKey: raw.secretKey,
          webhookUsername: raw.webhookUsername,
          webhookSecret: raw.webhookSecret,
          rsaId: raw.rsaId,
          rsaPublicKey: raw.rsaPublicKey,
          isActive: raw.isActive,
          testMode: raw.testMode,
          enabledPaymentMethods: raw.enabledPaymentMethods,
        });

    this.saveOp.run(request$).subscribe({
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
