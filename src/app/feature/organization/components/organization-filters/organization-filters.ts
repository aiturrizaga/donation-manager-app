import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { OrganizationFilters as OrgFiltersModel } from '../../models/organization.model';

@Component({
  selector: 'app-organization-filters',
  imports: [ReactiveFormsModule, InputTextModule, SelectModule, IconFieldModule, InputIconModule],
  templateUrl: './organization-filters.html',
  styleUrl: './organization-filters.scss',
})
export class OrganizationFilters {
  readonly filtersChange = output<OrgFiltersModel>();

  readonly statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false },
  ];

  readonly form = new FormGroup({
    search: new FormControl<string | null>(null),
    is_active: new FormControl<boolean | null>(null),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({
          search: value.search ?? null,
          is_active: value.is_active ?? null,
        });
      });
  }
}
