import { FormControl } from '@angular/forms';

export interface PaymentGateway {
  id: number;
  organizationId: number;
  provider: string;
  publicKeyMasked: string | null;
  isActive: boolean;
  testMode: boolean;
}

export interface PaymentGatewayCreateRequest {
  provider: string;
  publicKey: string;
  secretKey: string;
  webhookSecret?: string | null;
  rsaId?: string | null;
  rsaPublicKey?: string | null;
  isActive: boolean;
  testMode: boolean;
}

export interface PaymentGatewayUpdateRequest {
  publicKey?: string | null;
  secretKey?: string | null;
  webhookSecret?: string | null;
  rsaId?: string | null;
  rsaPublicKey?: string | null;
  isActive?: boolean;
  testMode?: boolean;
}

export interface PaymentGatewayTestResult {
  success: boolean;
  message: string;
}

export interface PaymentGatewayForm {
  provider: FormControl<string>;
  publicKey: FormControl<string>;
  secretKey: FormControl<string>;
  webhookSecret: FormControl<string | null>;
  rsaId: FormControl<string | null>;
  rsaPublicKey: FormControl<string | null>;
  isActive: FormControl<boolean>;
  testMode: FormControl<boolean>;
}
