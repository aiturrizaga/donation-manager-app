import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { MultiSelect } from 'primeng/multiselect';
import { DonorFilterParams } from '../../models/donor.model';
import { Organization } from '../../../organization/models/organization.model';

@Component({
  selector: 'app-donor-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon, MultiSelect],
  templateUrl: './donor-filters.html',
})
export class DonorFilters {
  readonly organizations = input.required<Organization[]>();
  readonly filtersChange = output<Omit<DonorFilterParams, 'isActive'>>();

  readonly form = new FormGroup({
    organizationIds: new FormControl<number[] | null>(null),
    search: new FormControl<string | null>(null),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({
          search: value.search ?? null,
          organizationIds: value.organizationIds ?? null,
        });
      });
  }
}
