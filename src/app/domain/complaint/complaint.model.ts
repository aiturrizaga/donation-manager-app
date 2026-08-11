export type ComplaintRecordType = 'reclamo' | 'queja';
export type ComplaintGoodType = 'producto' | 'servicio';
export type ComplaintStatus = 'pending' | 'in_review' | 'resolved' | 'closed';

export interface ComplaintOrganization {
  id: number;
  legalName: string;
  tradeName: string | null;
}

export interface ComplaintDonationPage {
  id: string;
  name: string;
}

export interface Complaint {
  id: string;
  organizationId: number | null;
  organization: ComplaintOrganization | null;
  donationPageId: string | null;
  donationPage: ComplaintDonationPage | null;
  sheetNumber: number;
  recordType: ComplaintRecordType;
  goodType: ComplaintGoodType;
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  isMinor: boolean;
  guardianName: string | null;
  amount: number | null;
  detail: string;
  request: string;
  dataConsent: boolean;
  status: ComplaintStatus;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface ComplaintFilterParams {
  search?: string | null;
  status?: string | null;
  recordType?: string | null;
  organizationIds?: number[] | null;
  unassigned?: boolean | null;
}

export interface ComplaintCreateRequest {
  organizationId: number;
  recordType: ComplaintRecordType;
  goodType: ComplaintGoodType;
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  isMinor: boolean;
  guardianName: string | null;
  amount: number | null;
  detail: string;
  request: string;
  dataConsent: boolean;
}

export interface ComplaintUpdateRequest {
  status?: ComplaintStatus;
  response?: string;
}
