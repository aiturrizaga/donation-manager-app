import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { DonationPageFilterParams } from '../../models/donation-page.model';
import { Organization } from '../../../organization/models/organization.model';

@Component({
  selector: 'app-donation-page-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon, Select],
  templateUrl: './donation-page-filters.html',
})
export class DonationPageFilters {
  readonly organizations = input.required<Organization[]>();
  readonly filtersChange = output<DonationPageFilterParams>();

  readonly form = new FormGroup({
    organizationId: new FormControl<number | null>(null),
    search: new FormControl<string | null>(null),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({
          organizationId: value.organizationId ?? null,
          search: value.search ?? null,
        });
      });
  }
}
