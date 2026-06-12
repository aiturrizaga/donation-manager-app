import { FormControl } from '@angular/forms';

export interface DonationPage {
  id: string;
  organizationId: number;
  name: string;
  slug: string;
  description: string | null;
  welcomeText: string | null;
  thankYouText: string | null;
  domain: string | null;
  domainStatus: 'pending' | 'verified' | 'error';
  isActive: boolean;
  isDefault: boolean;
  metadata: Record<string, unknown> | null;
  branding: PageBranding | null;
  formConfig: FormConfig | null;
  organization?: PageOrganization;
}

export interface PageOrganization {
  id: number;
  legalName: string;
  tradeName: string | null;
}

export interface PageBranding {
  id: number;
  donationPageId: string;
  companyName: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string | null;
}

export interface FormConfig {
  id: number;
  donationPageId: string;
  currencyOptions: string[];
  currencyDefault: string;
  currencyVisible: boolean;
  amountDefault: number | null;
  amountLocked: boolean;
  amountAllowCustom: boolean;
  amountMinCustom: number | null;
  suggestedAmounts: number[] | null;
  frequencyOptions: string[];
  frequencyDefault: string;
  frequencyVisible: boolean;
  confirmHeading: string;
  confirmMessage: string | null;
  confirmQuoteText: string | null;
  confirmQuoteAuthor: string | null;
}

export interface FormConfigTarget {
  id: number;
  formConfigId: number;
  targetId: number;
  isDefault: boolean;
  isLocked: boolean;
  isVisible: boolean;
  target: FormConfigTargetDetail;
}

export interface FormConfigTargetDetail {
  id: number;
  name: string;
  targetType: string;
  status: string;
  amountGoal: number | null;
  amountRaised: number;
}

export interface PaymentGateway {
  id: number;
  donationPageId: string;
  provider: string;
  isActive: boolean;
  testMode: boolean;
  hasWebhookSecret: boolean;
  hasRsaKeys: boolean;
}

export interface DonationPageFilterParams {
  search?: string | null;
  organizationId?: number | null;
  isActive?: boolean | null;
  domainStatus?: string | null;
}

export interface DonationPageSummary {
  id: string;
  organizationId: number;
  name: string;
  slug: string;
  domain: string | null;
  domainStatus: string;
  isActive: boolean;
  isDefault: boolean;
  hasBranding: boolean;
  hasFormConfig: boolean;
  organization?: PageOrganization;
}

// Form types
export interface DonationPageGeneralForm {
  name: FormControl<string>;
  slug: FormControl<string>;
  description: FormControl<string | null>;
  welcomeText: FormControl<string | null>;
  thankYouText: FormControl<string | null>;
  domain: FormControl<string | null>;
}

export interface PageBrandingForm {
  companyName: FormControl<string>;
  logoUrl: FormControl<string | null>;
  heroImageUrl: FormControl<string | null>;
  faviconUrl: FormControl<string | null>;
  primaryColor: FormControl<string>;
  secondaryColor: FormControl<string | null>;
}

export interface PaymentGatewayForm {
  publicKey: FormControl<string>;
  secretKey: FormControl<string>;
  webhookSecret: FormControl<string | null>;
  rsaId: FormControl<string | null>;
  rsaPublicKey: FormControl<string | null>;
  testMode: FormControl<boolean>;
}
