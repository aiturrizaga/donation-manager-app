export interface Donation {
  id: string;
  donationPageId: string;
  donorId: string;
  donationTargetId: number | null;
  subscriptionId: number | null;
  amount: number;
  currency: string;
  donationType: 'one_time' | 'recurring';
  paymentMethod: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'expired' | 'cancelled';
  providerTransactionRef: string | null;
  failureReason: string | null;
  refundedAt: string | null;
  refundReason: string | null;
  hasCertificate: boolean;
  createdAt: string;
  donor: DonationDonor | null;
  donationTarget: DonationTarget | null;
  donationPage: DonationPage | null;
  certificate: DonationCertificate | null;
}

export interface DonationCertificate {
  id: string;
  certificateNumber: string;
  fileUrl: string;
  sentByEmail: boolean;
  issuedAt: string;
}

export interface DonationDonor {
  id: string;
  name: string;
  email: string | null;
}

export interface DonationTarget {
  id: number;
  name: string;
  targetType: string;
}

export interface DonationPage {
  id: string;
  name: string;
  slug: string;
  organizationId: number;
  organization?: DonationOrganization;
}

export interface DonationOrganization {
  id: number;
  legalName: string;
  tradeName: string | null;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  providerEventId: string;
  eventType: string;
  status: 'received' | 'processed' | 'failed';
  processedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface DonationFilterParams {
  donationPageId?: string | null;
  donorId?: string | null;
  donationTargetId?: number | null;
  organizationIds?: number[] | null;
  status?: string | null;
  donationType?: string | null;
  currency?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  hasCertificate?: boolean | null;
}
