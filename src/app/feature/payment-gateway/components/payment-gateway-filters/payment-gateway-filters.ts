import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select } from 'primeng/select';
import { Organization } from '../../../organization/models/organization.model';

@Component({
  selector: 'app-payment-gateway-filters',
  imports: [ReactiveFormsModule, Select],
  templateUrl: './payment-gateway-filters.html',
})
export class PaymentGatewayFilters {
  readonly organizations = input.required<Organization[]>();
  readonly filtersChange = output<{ organizationId: number | null }>();

  readonly form = new FormGroup({
    organizationId: new FormControl<number | null>(null),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.filtersChange.emit({
          organizationId: value.organizationId ?? null,
        });
      });
  }
}
