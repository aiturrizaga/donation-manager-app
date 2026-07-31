// Which Culqi Custom Checkout payment method tabs a gateway can show.
// Only 'tarjeta' has been verified end-to-end against a real charge
// (2026-07-23) — the others change what the widget displays, but their
// resulting charge/order shape has not been tested against our adapter.
export type PaymentMethod = 'tarjeta' | 'yape' | 'billetera' | 'bancaMovil' | 'agente' | 'cuotealo';

export interface OrganizationPaymentGateway {
  id: number;
  organizationId: number;
  provider: string;
  publicKeyMasked: string | null;
  isActive: boolean;
  testMode: boolean;
  enabledPaymentMethods: PaymentMethod[];
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
}

export interface OrganizationPaymentGatewayTestResult {
  success: boolean;
  message: string;
}
