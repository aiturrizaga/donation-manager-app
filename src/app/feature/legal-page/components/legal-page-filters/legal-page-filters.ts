import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-legal-page-filters',
  imports: [ReactiveFormsModule, InputText, IconField, InputIcon],
  templateUrl: './legal-page-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPageFilters {
  // Refleja el `search` de la URL (F10): al recargar o compartir el link,
  // el input visible debe mostrar el mismo filtro que ya se aplicó.
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
