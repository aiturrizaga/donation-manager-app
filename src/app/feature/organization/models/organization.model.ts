import { FormControl } from '@angular/forms';

export interface Organization {
  id: number;
  legalName: string;
  tradeName: string | null;
  ruc: string;
  legalAddress: string | null;
  email: string | null;
  phone: string | null;
  logoPath: string | null;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  legalOwner: LegalOwner | null;
}

export interface LegalOwner {
  id: number;
  name: string;
  email: string | null;
}

export interface OrganizationFilterParams {
  search?: string | null;
  active?: boolean | null;
}

export interface OrganizationForm {
  legalName: FormControl<string>;
  tradeName: FormControl<string | null>;
  ruc: FormControl<string>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
}
