export type LegalPageType = 'privacy_policy' | 'terms_of_service' | null;

export interface LegalPageOrganization {
  id: number;
  legalName: string;
  tradeName: string | null;
}

export interface LegalPage {
  id: number;
  organizationId: number;
  organization: LegalPageOrganization | null;
  legalType: LegalPageType;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  isMandatory: boolean;
}

export interface LegalPageFilterParams {
  search?: string | null;
  isActive?: boolean | null;
  organizationIds?: number[] | null;
}

export interface LegalPageCreateRequest {
  organizationId: number;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
}

export interface LegalPageUpdateRequest {
  slug?: string;
  title?: string;
  content?: string;
  isActive?: boolean;
}
