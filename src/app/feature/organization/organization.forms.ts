import { FormControl } from '@angular/forms';

export interface OrganizationForm {
  alias: FormControl<string>;
  legalName: FormControl<string>;
  tradeName: FormControl<string | null>;
  ruc: FormControl<string>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
}

/** Solo la vista de detalle (OrganizationGeneralForm) usa el set completo. */
export interface OrganizationGeneralFormFields {
  alias: FormControl<string>;
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

export const ALIAS_TAKEN_ERROR = { alias: ['Ya existe otra organización con este alias.'] };
