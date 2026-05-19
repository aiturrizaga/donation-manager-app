import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { UserFilterParams } from '../../models/user.model';

@Component({
  selector: 'app-user-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon],
  templateUrl: './user-filters.html',
})
export class UserFilters {
  readonly filtersChange = output<Omit<UserFilterParams, 'isActive'>>();

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
