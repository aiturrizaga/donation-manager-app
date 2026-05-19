import { FormControl } from '@angular/forms';

export interface Donor {
  id: string;
  partnerId: number;
  isActive: boolean;
  hasAccount: boolean;
  metadata: Record<string, unknown> | null;
  partner: DonorPartner;
  createdAt: string;
}

export interface DonorPartner {
  id: number;
  name: string;
  partnerType: 'individual' | 'company';
  email: string | null;
  phone: string | null;
  documentNumber: string | null;
  documentVerified: boolean;
  address: string | null;
}

export interface DonorFilterParams {
  search?: string | null;
  isActive?: boolean | null;
  hasAccount?: boolean | null;
  organizationIds?: number[] | null;
}

export interface DonorCreateRequest {
  partnerType: 'individual' | 'company';
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string | null;
  phone?: string | null;
  documentTypeId?: number | null;
  documentNumber?: string | null;
  address?: string | null;
}

export type DocumentType = 'dni' | 'ruc';

export interface DonorCreateForm {
  documentType: FormControl<DocumentType>;
  documentNumber: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  businessName: FormControl<string>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  address: FormControl<string | null>;
}
