// Which Culqi Custom Checkout payment method tabs a gateway can show.
// Only 'tarjeta' has been verified end-to-end against a real charge
// (2026-07-23) — the others change what the widget displays, but their
// resulting charge/order shape has not been tested against our adapter.
export type PaymentMethod = 'tarjeta' | 'yape' | 'billetera' | 'bancaMovil' | 'agente' | 'cuotealo';

// Qué marcas de tarjeta tiene realmente habilitadas la cuenta Culqi del
// negocio — se configura en el propio dashboard de Culqi, no hay API para
// consultarlo, así que se replica acá para que el portal pueda decir
// "Aceptamos Visa, Mastercard..." en vez de un texto genérico fijo.
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'diners';

export interface OrganizationPaymentGateway {
  id: number;
  organizationId: number;
  provider: string;
  publicKeyMasked: string | null;
  isActive: boolean;
  testMode: boolean;
  enabledPaymentMethods: PaymentMethod[];
  enabledCardBrands: CardBrand[];
}

export interface OrganizationPaymentGatewayCreateRequest {
  provider: string;
  publicKey: string;
  secretKey: string;
  webhookUsername?: string | null;
  webhookSecret?: string | null;
  rsaId?: string | null;
  rsaPublicKey?: string | null;
  isActive: boolean;
  testMode: boolean;
  enabledPaymentMethods: PaymentMethod[];
  enabledCardBrands: CardBrand[];
}

export interface OrganizationPaymentGatewayUpdateRequest {
  publicKey?: string | null;
  secretKey?: string | null;
  webhookUsername?: string | null;
  webhookSecret?: string | null;
  rsaId?: string | null;
  rsaPublicKey?: string | null;
  isActive?: boolean;
  testMode?: boolean;
  enabledPaymentMethods?: PaymentMethod[];
  enabledCardBrands?: CardBrand[];
}

export interface OrganizationPaymentGatewayTestResult {
  success: boolean;
  message: string;
}
