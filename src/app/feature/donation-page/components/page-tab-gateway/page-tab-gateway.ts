import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tag } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DonationPage, DonationPageGateway } from '@domain/donation-page';
import { DonationPageGatewayForm } from '../../donation-page.forms';
import { DonationPageApi } from '../../api/donation-page.api';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

@Component({
  selector: 'app-page-tab-gateway',
  imports: [ReactiveFormsModule, FormsModule, InputText, Button, Message, ToggleSwitch, Tag],
  templateUrl: './page-tab-gateway.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTabGateway implements OnInit {
  readonly page = input.required<DonationPage>();

  readonly #api = inject(DonationPageApi);
  readonly #fb = inject(FormBuilder);
  readonly #confirm = inject(ConfirmationService);

  protected readonly saveOp = operationState();
  protected readonly testOp = operationState();
  protected readonly toggleOp = operationState();
  readonly gateway = signal<DonationPageGateway | null>(null);
  readonly testResult = signal<{ success: boolean; message: string } | null>(null);
  readonly showSecrets = signal(false);

  readonly form: FormGroup<DonationPageGatewayForm> = this.#fb.group({
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
    const raw = this.form.getRawValue();
    const gw = this.gateway();

    const request$ = gw
      ? this.#api.updateGateway(this.page().id, raw)
      : this.#api.createGateway(this.page().id, raw);
    const successMessage = gw ? 'Configuración de pasarela actualizada.' : 'Pasarela configurada.';

    this.saveOp.run(request$, successMessage).subscribe({
      next: (updated) => this.gateway.set(updated),
      error: (err: AppError) => {
        if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
      },
    });
  }

  testConnection(): void {
    this.testResult.set(null);
    this.testOp.run(this.#api.testGateway(this.page().id)).subscribe({
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
        const call$ = gw.isActive
          ? this.#api.deactivateGateway(this.page().id)
          : this.#api.activateGateway(this.page().id);
        const successMessage = gw.isActive ? 'Pasarela desactivada.' : 'Pasarela activada.';
        this.toggleOp.run(call$, successMessage).subscribe({
          next: (updated) => this.gateway.set(updated),
        });
      },
    });
  }
}
