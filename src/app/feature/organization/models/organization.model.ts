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

export interface OrganizationFilters {
  search?: string | null;
  is_active?: boolean | null;
}
