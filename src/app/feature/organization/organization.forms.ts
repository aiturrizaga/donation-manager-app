import { FormControl } from '@angular/forms';

export interface OrganizationForm {
  legalName: FormControl<string>;
  tradeName: FormControl<string | null>;
  ruc: FormControl<string>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
}

/** Solo la vista de detalle (OrganizationGeneralForm) usa el set completo. */
export interface OrganizationGeneralFormFields {
  legalName: FormControl<string>;
  tradeName: FormControl<string | null>;
  ruc: FormControl<string>;
  legalAddress: FormControl<string | null>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  mobilePhone: FormControl<string | null>;
  legalRepresentativeName: FormControl<string | null>;
  legalRepresentativeTitle: FormControl<string | null>;
  donationResolutionNumber: FormControl<string | null>;
  donationResolutionDate: FormControl<string | null>;
}
