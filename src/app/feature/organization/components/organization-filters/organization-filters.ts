import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { OrganizationFilterParams } from '../../models/organization.model';

@Component({
  selector: 'app-organization-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon],
  templateUrl: './organization-filters.html',
})
export class OrganizationFilters {
  readonly filtersChange = output<Omit<OrganizationFilterParams, 'active'>>();

  readonly form = new FormGroup({
    search: new FormControl<string | null>(null),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({ search: value.search ?? null });
      });
  }
}
