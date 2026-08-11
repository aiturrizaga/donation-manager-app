export interface DonationPage {
  id: string;
  organizationId: number;
  name: string;
  slug: string;
  // Internal note for the admin team — never shown on the public portal.
  // Public-facing copy (heading/welcome text) lives on PageBranding instead.
  description: string | null;
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
  // Public hero copy — rendered on the donation portal's landing page.
  // NULL falls back to the frontend's own default copy.
  heroHeading: string | null;
  welcomeText: string | null;
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
  /** Mensajes cortos (máx. 140 caracteres, ~2 líneas); el portal muestra uno al azar. */
  impactMessages: string[] | null;
  confirmHeading: string;
  confirmMessage: string | null;
  confirmQuoteText: string | null;
  confirmQuoteAuthor: string | null;
  privacyPolicyOverride: string | null;
  termsOfServiceOverride: string | null;
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

/** Pasarela de pago propia de una DonationPage (distinta de OrganizationPaymentGateway). */
export interface DonationPageGateway {
  id: number;
  donationPageId: string;
  provider: string;
  isActive: boolean;
  testMode: boolean;
  hasWebhookSecret: boolean;
  hasRsaKeys: boolean;
}

/** Pasarela de la organización habilitada dentro del FormConfig de una página. */
export interface FormConfigGateway {
  id: number;
  formConfigId: number;
  paymentGatewayId: number;
  provider: string;
  isDefault: boolean;
  isActive: boolean;
  testMode: boolean;
}

export interface FormConfigGatewayAddRequest {
  paymentGatewayId: number;
  isDefault: boolean;
}

export interface DonationPageFilterParams {
  search?: string | null;
  organizationIds?: number[] | null;
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
