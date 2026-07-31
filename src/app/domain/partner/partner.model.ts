export interface Partner {
  id: number;
  partnerType: 'individual' | 'company';
  firstName: string;
  lastName: string;
  businessName: string | null;
  tradeName: string | null;
  email: string | null;
  phone: string | null;
  documentNumber: string | null;
  documentVerified: boolean;
  address: string | null;
  isActive: boolean;
}

export interface PartnerUpdateRequest {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string | null;
  phone?: string | null;
  documentNumber?: string | null;
  address?: string | null;
}
