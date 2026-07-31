import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-donation-page-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon],
  templateUrl: './donation-page-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationPageFilters {
  readonly search = input<string | null>(null);
  readonly filtersChange = output<{ search: string | null }>();

  readonly form = new FormGroup({
    search: new FormControl<string | null>(null),
  });

  constructor() {
    effect(() => {
      this.form.patchValue({ search: this.search() }, { emitEvent: false });
    });

    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({ search: value.search ?? null });
      });
  }
}
