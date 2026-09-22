import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { TARGET_TYPE_OPTIONS } from '@shared/utils/target-type.util';

@Component({
  selector: 'app-donation-target-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon, Select],
  templateUrl: './donation-target-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationTargetFilters {
  readonly filtersChange = output<{ search: string | null; targetType: string | null }>();

  readonly typeOptions = TARGET_TYPE_OPTIONS;

  readonly form = new FormGroup({
    search: new FormControl<string | null>(null),
    targetType: new FormControl<string | null>(null),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({
          search: value.search ?? null,
          targetType: value.targetType ?? null,
        });
      });
  }

  reset(): void {
    this.form.reset();
  }
}
