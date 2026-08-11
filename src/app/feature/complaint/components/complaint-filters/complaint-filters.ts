import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';

const RECORD_TYPE_OPTIONS = [
  { label: 'Reclamo', value: 'reclamo' },
  { label: 'Queja', value: 'queja' },
];

@Component({
  selector: 'app-complaint-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon, Select],
  templateUrl: './complaint-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintFilters {
  // Refleja el `search`/`recordType` de la URL (F10): al recargar o compartir el
  // link, los inputs visibles deben mostrar el mismo filtro que ya se aplicó.
  readonly search = input<string | null>(null);
  readonly recordType = input<string | null>(null);
  readonly filtersChange = output<{ search: string | null; recordType: string | null }>();

  readonly recordTypeOptions = RECORD_TYPE_OPTIONS;

  readonly form = new FormGroup({
    search: new FormControl<string | null>(null),
    recordType: new FormControl<string | null>(null),
  });

  constructor() {
    effect(() => {
      this.form.patchValue(
        { search: this.search(), recordType: this.recordType() },
        { emitEvent: false },
      );
    });

    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({
          search: value.search ?? null,
          recordType: value.recordType ?? null,
        });
      });
  }
}
