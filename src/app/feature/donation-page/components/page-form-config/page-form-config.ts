import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
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
import { FormConfig } from '../../models/donation-page.model';
import { FormValidator } from '@shared/utils/form-validator.util';

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
  currencyOptions: any;
  currencyDefault: any;
  currencyVisible: any;
  amountDefault: any;
  amountLocked: any;
  amountAllowCustom: any;
  amountMinCustom: any;
  frequencyOptions: any;
  frequencyDefault: any;
  frequencyVisible: any;
  confirmHeading: any;
  confirmMessage: any;
  confirmQuoteText: any;
  confirmQuoteAuthor: any;
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
  ],
  templateUrl: './page-form-config.html',
})
export class PageFormConfig implements OnInit {
  readonly pageId = input.required<string>();
  readonly initialConfig = input<FormConfig | null>(null);
  readonly saved = output<FormConfig>();

  readonly #api = inject(DonationPageApi);
  readonly #fb = inject(FormBuilder);

  readonly isSaving = signal(false);
  readonly hasExisting = signal(false);
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
  });

  readonly formValidator = new FormValidator(this.form);

  ngOnInit(): void {
    const config = this.initialConfig();
    if (config) {
      this.hasExisting.set(true);
      this.form.patchValue(config);
    }
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
        this.saved.emit(config);
      },
      error: (err) => console.error('[PageFormConfig]', err),
    });
  }
}
