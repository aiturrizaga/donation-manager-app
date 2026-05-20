import { Component, inject, input, output, signal, OnInit } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { DonationPageApi } from '../../api/donation-page.api';
import { PaymentGatewayApi } from '../../../payment-gateway/api/payment-gateway.api';
import { FormConfig } from '../../models/donation-page.model';
import { PaymentGateway } from '../../../payment-gateway/models/payment-gateway.model';
import { FormValidator } from '@shared/utils/form-validator.util';
import { FormConfigGatewayApi } from '../../api/form-config-gateway.api';
import { FormConfigGateway } from '../../models/payment-gateway.model';
import { RouterLink } from '@angular/router';

const CURRENCY_OPTIONS = [
  { label: 'PEN — Sol peruano', value: 'PEN' },
  { label: 'USD — Dólar americano', value: 'USD' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Única', value: 'one_time' },
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'annual' },
];

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
  confirmHeading: FormControl<string>;
  confirmMessage: FormControl<string | null>;
  confirmQuoteText: FormControl<string | null>;
  confirmQuoteAuthor: FormControl<string | null>;
  gatewayIds: FormControl<number[]>;
  defaultGatewayId: FormControl<number | null>;
}

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
    RouterLink,
  ],
  templateUrl: './page-form-config.html',
})
export class PageFormConfig implements OnInit {
  readonly pageId = input.required<string>();
  readonly organizationId = input.required<number>();
  readonly initialConfig = input<FormConfig | null>(null);
  readonly saved = output<FormConfig>();

  readonly #api = inject(DonationPageApi);
  readonly #gatewayApi = inject(PaymentGatewayApi);
  readonly #formGatewayApi = inject(FormConfigGatewayApi);
  readonly #fb = inject(FormBuilder);

  readonly isSaving = signal(false);
  readonly hasExisting = signal(false);
  readonly formConfigId = signal<number | null>(null);

  // Gateway state
  readonly availableGateways = signal<PaymentGateway[]>([]);
  readonly linkedGateways = signal<FormConfigGateway[]>([]);
  readonly isSavingGateways = signal(false);

  readonly currencyOptions = CURRENCY_OPTIONS;
  readonly frequencyOptions = FREQUENCY_OPTIONS;

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
    confirmHeading: this.#fb.control('¡Gracias por tu donación!', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    confirmMessage: this.#fb.control<string | null>(null),
    confirmQuoteText: this.#fb.control<string | null>(null),
    confirmQuoteAuthor: this.#fb.control<string | null>(null),
    gatewayIds: this.#fb.control<number[]>([], { nonNullable: true }),
    defaultGatewayId: this.#fb.control<number | null>(null),
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    const config = this.initialConfig();
    if (config) {
      this.hasExisting.set(true);
      this.formConfigId.set(config.id);
      this.form.patchValue(config);
      this.#loadGateways(config.id);
    }
    this.#loadAvailableGateways();
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

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    const request$ = this.hasExisting()
      ? this.#api.updateFormConfig(this.pageId(), raw)
      : this.#api.createFormConfig(this.pageId(), raw);

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
