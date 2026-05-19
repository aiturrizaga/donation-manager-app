import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tag } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DonationPage, PaymentGateway, PaymentGatewayForm } from '../../models/donation-page.model';
import { DonationPageApi } from '../../api/donation-page.api';
import { FormValidator } from '@shared/utils/form-validator.util';

@Component({
  selector: 'app-page-tab-gateway',
  imports: [ReactiveFormsModule, FormsModule, InputText, Button, Message, ToggleSwitch, Tag],
  providers: [ConfirmationService],
  templateUrl: './page-tab-gateway.html',
})
export class PageTabGateway implements OnInit {
  readonly page = input.required<DonationPage>();

  readonly #api = inject(DonationPageApi);
  readonly #fb = inject(FormBuilder);
  readonly #confirm = inject(ConfirmationService);

  readonly isSaving = signal(false);
  readonly isTesting = signal(false);
  readonly isTogglingActive = signal(false);
  readonly gateway = signal<PaymentGateway | null>(null);
  readonly testResult = signal<{ success: boolean; message: string } | null>(null);
  readonly showSecrets = signal(false);

  readonly form: FormGroup<PaymentGatewayForm> = this.#fb.group({
    publicKey: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    secretKey: this.#fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    webhookSecret: this.#fb.control<string | null>(null),
    rsaId: this.#fb.control<string | null>(null),
    rsaPublicKey: this.#fb.control<string | null>(null),
    testMode: this.#fb.control(true, { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    this.#api.getGateway(this.page().id).subscribe({
      next: (gw) => this.gateway.set(gw),
      error: () => this.gateway.set(null),
    });
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const gw = this.gateway();

    const request$ = gw
      ? this.#api.updateGateway(this.page().id, raw)
      : this.#api.createGateway(this.page().id, raw);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (updated) => this.gateway.set(updated),
      error: (err) => console.error('[PageTabGateway]', err),
    });
  }

  testConnection(): void {
    this.isTesting.set(true);
    this.testResult.set(null);
    this.#api
      .testGateway(this.page().id)
      .pipe(finalize(() => this.isTesting.set(false)))
      .subscribe({
        next: (result) => this.testResult.set(result),
        error: () =>
          this.testResult.set({
            success: false,
            message: 'Error al conectar con Culqi.',
          }),
      });
  }

  toggleActive(): void {
    const gw = this.gateway();
    if (!gw) return;

    const action = gw.isActive ? 'desactivar' : 'activar';
    this.#confirm.confirm({
      message: `¿Deseas ${action} la pasarela de pago?`,
      header: gw.isActive ? 'Desactivar pasarela' : 'Activar pasarela',
      icon: 'ti ti-credit-card',
      rejectLabel: 'No',
      acceptLabel: `Sí, ${action}`,
      acceptButtonProps: gw.isActive ? { severity: 'danger' } : {},
      accept: () => {
        this.isTogglingActive.set(true);
        const call$ = gw.isActive
          ? this.#api.deactivateGateway(this.page().id)
          : this.#api.activateGateway(this.page().id);
        call$.pipe(finalize(() => this.isTogglingActive.set(false))).subscribe({
          next: (updated) => this.gateway.set(updated),
        });
      },
    });
  }
}
