import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';

const STATUS_OPTIONS = [
  { label: 'Completado', value: 'completed' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Fallido', value: 'failed' },
  { label: 'Reembolsado', value: 'refunded' },
  { label: 'Expirado', value: 'expired' },
];

const TYPE_OPTIONS = [
  { label: 'Única', value: 'one_time' },
  { label: 'Recurrente', value: 'recurring' },
];

@Component({
  selector: 'app-donation-filters',
  imports: [ReactiveFormsModule, Select, MultiSelect, DatePicker],
  templateUrl: './donation-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationFilters {
  readonly filtersChange = output<{
    status: string | null;
    donationType: string | null;
    dateFrom: string | null;
    dateTo: string | null;
  }>();

  readonly statusOptions = STATUS_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;

  readonly form = new FormGroup({
    status: new FormControl<string | null>(null),
    donationType: new FormControl<string | null>(null),
    dateFrom: new FormControl<Date | null>(null),
    dateTo: new FormControl<Date | null>(null),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({
          status: value.status ?? null,
          donationType: value.donationType ?? null,
          dateFrom: value.dateFrom?.toISOString() ?? null,
          dateTo: value.dateTo?.toISOString() ?? null,
        });
      });
  }
}
