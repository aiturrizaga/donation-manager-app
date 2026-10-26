import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmailSettingsApi } from '@shared/api/organization-email-settings.api';
import { OrganizationEmailSettings } from '@domain/email-settings';
import { EmailSettingsFormFields } from '../../email-settings.forms';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

/**
 * Formulario de configuración SMTP de una organización — hay como mucho una
 * fila por organización (ver EmailSettingsFacade), así que a diferencia de
 * Payment Gateways no hace falta un modal ni una lista: este componente
 * cubre crear, editar, probar y eliminar la configuración en un solo lugar.
 */
@Component({
  selector: 'app-email-settings-form',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    InputText,
    InputNumber,
    Password,
    Button,
    Message,
    Tag,
    ToggleSwitch,
  ],
  templateUrl: './email-settings-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailSettingsForm {
  readonly organizationId = input.required<number>();
  readonly settings = input<OrganizationEmailSettings | null>(null);

  readonly saved = output<OrganizationEmailSettings>();
  readonly deleted = output<void>();

  readonly #api = inject(EmailSettingsApi);
  readonly #fb = inject(FormBuilder);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);

  protected readonly saveOp = operationState();
  protected readonly testOp = operationState();
  protected readonly deleteOp = operationState();

  readonly form: FormGroup<EmailSettingsFormFields> = this.#fb.group({
    smtpHost: this.#fb.control('', { validators: [Validators.required], nonNullable: true }),
    smtpPort: this.#fb.control(587, {
      validators: [Validators.required, Validators.min(1), Validators.max(65535)],
      nonNullable: true,
    }),
    smtpUser: this.#fb.control('', { validators: [Validators.required], nonNullable: true }),
    smtpPassword: this.#fb.control<string | null>(null, { validators: [Validators.required] }),
    fromName: this.#fb.control('', { validators: [Validators.required], nonNullable: true }),
    fromEmail: this.#fb.control('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    useTls: this.#fb.control(true, { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  constructor() {
    // Reinicializa el formulario cada vez que cambia la organización
    // seleccionada o se recarga su configuración (tras guardar/eliminar).
    effect(() => {
      // Suscribe a organizationId() para que el efecto vuelva a correr al
      // cambiar de organización, aunque settings() sea null en ambos casos.
      this.organizationId();
      const current = this.settings();

      if (current) {
        this.form.patchValue({
          smtpHost: current.smtpHost,
          smtpPort: current.smtpPort,
          smtpUser: current.smtpUser,
          fromName: current.fromName,
          fromEmail: current.fromEmail,
          useTls: current.useTls,
        });
        // La contraseña es write-only — no se prellena. Es opcional al editar.
        this.form.controls.smtpPassword.setValue(null);
        this.form.controls.smtpPassword.clearValidators();
      } else {
        this.form.reset({ smtpPort: 587, useTls: true });
        this.form.controls.smtpPassword.setValidators([Validators.required]);
      }
      this.form.controls.smtpPassword.updateValueAndValidity();
    });
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const raw = this.form.getRawValue();
    this.saveOp
      .run(
        this.#api.upsert(this.organizationId(), {
          smtpHost: raw.smtpHost,
          smtpPort: raw.smtpPort,
          smtpUser: raw.smtpUser,
          smtpPassword: raw.smtpPassword || null,
          fromName: raw.fromName,
          fromEmail: raw.fromEmail,
          useTls: raw.useTls,
        }),
        'Configuración SMTP guardada.',
      )
      .subscribe({
        next: (result) => this.saved.emit(result),
        error: (err: AppError) => {
          if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
        },
      });
  }

  test(): void {
    this.testOp.run(this.#api.test(this.organizationId())).subscribe({
      next: (result) => {
        this.#message.add({
          severity: result.success ? 'success' : 'error',
          summary: result.success ? 'Conexión exitosa' : 'Error de conexión',
          detail: result.message,
        });
        if (result.success) this.saved.emit({ ...this.settings()!, isVerified: true });
      },
      error: () => {
        this.#message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar el correo de prueba.',
        });
      },
    });
  }

  confirmDelete(): void {
    this.#confirm.confirm({
      message:
        'Se eliminará la configuración SMTP de esta organización y volverá a usar el servidor de correo por defecto de la plataforma. ¿Deseas continuar?',
      header: 'Eliminar configuración SMTP',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.#delete(),
    });
  }

  #delete(): void {
    this.deleteOp.run(this.#api.delete(this.organizationId()), 'Configuración SMTP eliminada.').subscribe({
      next: () => this.deleted.emit(),
    });
  }
}
