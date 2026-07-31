import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { OrganizationFilterParams } from '@domain/organization';

@Component({
  selector: 'app-organization-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon],
  templateUrl: './organization-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationFilters {
  // Refleja el `search` de la URL (F10): al recargar o compartir el link,
  // el input visible debe mostrar el mismo filtro que ya se aplicó a los datos.
  readonly search = input<string | null>(null);
  readonly filtersChange = output<Omit<OrganizationFilterParams, 'active'>>();

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
