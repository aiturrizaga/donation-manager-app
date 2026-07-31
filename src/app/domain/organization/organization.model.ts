export interface Organization {
  id: number;
  legalName: string;
  tradeName: string | null;
  ruc: string;
  legalAddress: string | null;
  email: string | null;
  phone: string | null;
  mobilePhone: string | null;
  logoPath: string | null;
  // Selects this org's asset folder (logo/seal/signature) for certificate
  // generation — see app/core/certificate/generator.py (backend).
  slug: string | null;
  // Certificate legal data — see app/core/certificate/organization_data.py
  // (backend): certificate generation fails loudly if any of these four are
  // missing, since a donation tax-deduction certificate with the wrong
  // legal representative or SUNAT resolution is a compliance problem.
  legalRepresentativeName: string | null;
  legalRepresentativeTitle: string | null;
  donationResolutionNumber: string | null;
  donationResolutionDate: string | null;
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

export interface OrganizationCreateRequest {
  legalName: string;
  tradeName: string | null;
  ruc: string;
  email: string | null;
  phone: string | null;
}

export interface OrganizationUpdateRequest {
  legalName?: string;
  tradeName?: string | null;
  ruc?: string;
  legalAddress?: string | null;
  email?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  slug?: string | null;
  legalRepresentativeName?: string | null;
  legalRepresentativeTitle?: string | null;
  donationResolutionNumber?: string | null;
  donationResolutionDate?: string | null;
}
