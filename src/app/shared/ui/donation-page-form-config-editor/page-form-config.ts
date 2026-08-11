import { ChangeDetectionStrategy, Component, inject, input, output, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { InputNumber } from 'primeng/inputnumber';
import { Editor } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import { DonationPageFormConfigApi } from '@shared/api/donation-page-form-config.api';
import { PaymentGatewayApi } from '@shared/api/organization-payment-gateway.api';
import { FormConfigGatewayApi } from '@shared/api/form-config-gateway.api';
import { LegalPageApi } from '@shared/api/legal-page.api';
import { LookupApi } from '@shared/api/lookup.api';
import { FormConfig, FormConfigGateway } from '@domain/donation-page';
import { MessageService } from 'primeng/api';
import { OrganizationPaymentGateway } from '@domain/payment-gateway';
import { FormValidator } from '@shared/utils/form-validator.util';
import { RouterLink } from '@angular/router';
import { AutoComplete } from 'primeng/autocomplete';

// Matches the backend limit (app/modules/donation_page/schemas.py) — ~2
// lines of text-xs inside the portal's impact banner (donation-step1.html).
const IMPACT_MESSAGE_MAX_LENGTH = 140;
const IMPACT_MESSAGES_MAX_COUNT = 10;

interface FormConfigForm {
  currencyOptions: FormControl<string[]>;
  currencyDefault: FormControl<string>;
  currencyVisible: FormControl<boolean>;
  amountDefault: FormControl<number | null>;
  amountLocked: FormControl<boolean>;
  amountAllowCustom: FormControl<boolean>;
  amountMinCustom: FormControl<number | null>;
  frequencyOptions: FormControl<string[]>;
  frequencyDefault: FormControl<string>;
  frequencyVisible: FormControl<boolean>;
  impactMessages: FormControl<string[]>;
  confirmHeading: FormControl<string>;
  confirmMessage: FormControl<string | null>;
  confirmQuoteText: FormControl<string | null>;
  confirmQuoteAuthor: FormControl<string | null>;
  privacyPolicyOverride: FormControl<string | null>;
  termsOfServiceOverride: FormControl<string | null>;
  gatewayIds: FormControl<number[]>;
  defaultGatewayId: FormControl<number | null>;
  suggestedAmounts: FormControl<string[]>;
}

/**
 * Editor de FormConfig de una DonationPage. Compartido entre la pestaña
 * "Formulario" de `donation-pages` y la feature `donation-form` (F5) — por
 * eso vive en shared/ui en vez de dentro de una sola feature.
 */
@Component({
  selector: 'app-page-form-config',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputText,
    Textarea,
    Button,
    Message,
    Select,
    MultiSelect,
    ToggleSwitch,
    InputNumber,
    AutoComplete,
    RouterLink,
    Editor,
  ],
  templateUrl: './page-form-config.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFormConfig implements OnInit {
  readonly pageId = input.required<string>();
  readonly organizationId = input.required<number>();
  readonly initialConfig = input<FormConfig | null>(null);
  readonly saved = output<FormConfig>();

  readonly #api = inject(DonationPageFormConfigApi);
  readonly #gatewayApi = inject(PaymentGatewayApi);
  readonly #formGatewayApi = inject(FormConfigGatewayApi);
  readonly #legalPageApi = inject(LegalPageApi);
  readonly #lookupApi = inject(LookupApi);
  readonly #fb = inject(FormBuilder);
  readonly #message = inject(MessageService);

  readonly isSaving = signal(false);
  readonly hasExisting = signal(false);
  readonly formConfigId = signal<number | null>(null);

  // Legal — heredado de la organización vs. personalizado por esta página.
  readonly privacyPolicyCustomized = signal(false);
  readonly termsOfServiceCustomized = signal(false);
  readonly orgPrivacyPolicyContent = signal<string | null>(null);
  readonly orgTermsOfServiceContent = signal<string | null>(null);

  // Gateway state
  readonly availableGateways = signal<OrganizationPaymentGateway[]>([]);
  readonly linkedGateways = signal<FormConfigGateway[]>([]);
  readonly isSavingGateways = signal(false);

  // Catálogos internos (ver /settings/lookups) — ya no están en duro acá.
  readonly currencyOptions = signal<{ label: string; value: string }[]>([]);
  readonly frequencyOptions = signal<{ label: string; value: string }[]>([]);

  readonly form: FormGroup<FormConfigForm> = this.#fb.group({
    currencyOptions: this.#fb.control(['PEN'], { nonNullable: true }),
    currencyDefault: this.#fb.control('PEN', { nonNullable: true }),
    currencyVisible: this.#fb.control(true, { nonNullable: true }),
    amountDefault: this.#fb.control<number | null>(null),
    amountLocked: this.#fb.control(false, { nonNullable: true }),
    amountAllowCustom: this.#fb.control(true, { nonNullable: true }),
    amountMinCustom: this.#fb.control<number | null>(null),
    frequencyOptions: this.#fb.control(['one_time'], { nonNullable: true }),
    frequencyDefault: this.#fb.control('one_time', { nonNullable: true }),
    frequencyVisible: this.#fb.control(true, { nonNullable: true }),
    impactMessages: this.#fb.control<string[]>([], { nonNullable: true }),
    confirmHeading: this.#fb.control('¡Gracias por tu donación!', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    confirmMessage: this.#fb.control<string | null>(null),
    confirmQuoteText: this.#fb.control<string | null>(null),
    confirmQuoteAuthor: this.#fb.control<string | null>(null),
    privacyPolicyOverride: this.#fb.control<string | null>(null),
    termsOfServiceOverride: this.#fb.control<string | null>(null),
    gatewayIds: this.#fb.control<number[]>([], { nonNullable: true }),
    defaultGatewayId: this.#fb.control<number | null>(null),
    suggestedAmounts: this.#fb.control<string[]>([], { nonNullable: true }),
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    const config = this.initialConfig();
    if (config) {
      this.hasExisting.set(true);
      this.formConfigId.set(config.id);
      this.form.patchValue({
        ...config,
        suggestedAmounts: config.suggestedAmounts?.map(String) ?? [],
        impactMessages: config.impactMessages ?? [],
      });
      this.privacyPolicyCustomized.set(!!config.privacyPolicyOverride);
      this.termsOfServiceCustomized.set(!!config.termsOfServiceOverride);
      this.#loadGateways(config.id);
    }
    this.#loadAvailableGateways();
    this.#loadOrganizationLegalPages();
    this.#loadLookupOptions();
  }

  #loadLookupOptions(): void {
    this.#lookupApi
      .getByCode('currency_options')
      .subscribe((lookup) =>
        this.currencyOptions.set(lookup.items.map((i) => ({ label: i.label, value: i.value }))),
      );
    this.#lookupApi
      .getByCode('frequency_options')
      .subscribe((lookup) =>
        this.frequencyOptions.set(lookup.items.map((i) => ({ label: i.label, value: i.value }))),
      );
  }

  #loadOrganizationLegalPages(): void {
    this.#legalPageApi
      .getAll({ page: 1, size: 50 }, { organizationIds: [this.organizationId()] })
      .subscribe((result) => {
        this.orgPrivacyPolicyContent.set(
          result.items.find((p) => p.legalType === 'privacy_policy')?.content ?? null,
        );
        this.orgTermsOfServiceContent.set(
          result.items.find((p) => p.legalType === 'terms_of_service')?.content ?? null,
        );
      });
  }

  setPrivacyPolicyCustomized(customized: boolean): void {
    this.privacyPolicyCustomized.set(customized);
    if (!customized) this.form.controls.privacyPolicyOverride.setValue(null);
  }

  setTermsOfServiceCustomized(customized: boolean): void {
    this.termsOfServiceCustomized.set(customized);
    if (!customized) this.form.controls.termsOfServiceOverride.setValue(null);
  }

  #loadAvailableGateways(): void {
    this.#gatewayApi.getAll(this.organizationId()).subscribe((gateways) => {
      this.availableGateways.set(gateways.filter((g) => g.isActive));
    });
  }

  #loadGateways(formConfigId: number): void {
    this.#formGatewayApi.getAll(formConfigId).subscribe((linked) => {
      this.linkedGateways.set(linked);
      const def = linked.find((l) => l.isDefault);
      this.form.patchValue({
        gatewayIds: linked.map((l) => l.paymentGatewayId),
        defaultGatewayId: def?.paymentGatewayId ?? null,
      });
    });
  }

  onAmountAdd(event: { value: string[] }): void {
    const added = event.value.at(-1);
    if (!added) return;

    if (!/^\d+(\.\d{1,2})?$/.test(added) || Number(added) <= 0) {
      this.form.controls.suggestedAmounts.setValue(
        this.form.controls.suggestedAmounts.value.filter((v) => v !== added),
      );
    }
  }

  onImpactMessageAdd(event: { value: string[] }): void {
    const added = event.value.at(-1);
    if (!added) return;

    const control = this.form.controls.impactMessages;

    if (control.value.length > IMPACT_MESSAGES_MAX_COUNT) {
      control.setValue(control.value.filter((v) => v !== added));
      this.#message.add({
        severity: 'warn',
        summary: 'Límite alcanzado',
        detail: `No puedes agregar más de ${IMPACT_MESSAGES_MAX_COUNT} mensajes.`,
      });
      return;
    }

    if (added.length > IMPACT_MESSAGE_MAX_LENGTH) {
      control.setValue(control.value.filter((v) => v !== added));
      this.#message.add({
        severity: 'warn',
        summary: 'Mensaje muy largo',
        detail: `Cada mensaje debe tener como máximo ${IMPACT_MESSAGE_MAX_LENGTH} caracteres.`,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    const suggestedAmounts =
      raw.suggestedAmounts.length > 0
        ? raw.suggestedAmounts.map(Number).filter((v) => !isNaN(v) && v > 0)
        : null;

    const impactMessages = raw.impactMessages.length > 0 ? raw.impactMessages : null;

    const request$ = this.hasExisting()
      ? this.#api.updateFormConfig(this.pageId(), { ...raw, suggestedAmounts, impactMessages })
      : this.#api.createFormConfig(this.pageId(), { ...raw, suggestedAmounts, impactMessages });

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (config) => {
        this.hasExisting.set(true);
        this.formConfigId.set(config.id);
        this.saved.emit(config);
        this.#loadGateways(config.id);
      },
      error: (err) => console.error('[PageFormConfig]', err),
    });
  }

  saveGateways(): void {
    const formConfigId = this.formConfigId();
    if (!formConfigId) return;

    const currentIds = this.linkedGateways().map((l) => l.paymentGatewayId);
    const selectedIds: number[] = this.form.getRawValue().gatewayIds ?? [];
    const defaultId: number | null = this.form.getRawValue().defaultGatewayId;

    const toAdd = selectedIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !selectedIds.includes(id));

    this.isSavingGateways.set(true);

    const ops$ = [
      ...toRemove.map((id) => this.#formGatewayApi.remove(formConfigId, id)),
      ...toAdd.map((id) =>
        this.#formGatewayApi.add(formConfigId, {
          paymentGatewayId: id,
          isDefault: id === defaultId,
        }),
      ),
    ];

    const existingDefault = this.linkedGateways().find((l) => l.isDefault);
    const defaultChanged =
      defaultId !== null &&
      existingDefault?.paymentGatewayId !== defaultId &&
      !toAdd.includes(defaultId);

    const base$ = ops$.length ? forkJoin(ops$) : of([] as any[]);

    base$.pipe(finalize(() => this.isSavingGateways.set(false))).subscribe({
      next: () => {
        if (defaultChanged && defaultId) {
          this.#formGatewayApi
            .setDefault(formConfigId, defaultId)
            .subscribe(() => this.#loadGateways(formConfigId));
        } else {
          this.#loadGateways(formConfigId);
        }
      },
      error: (err) => console.error('[PageFormConfig] saveGateways', err),
    });
  }
}
