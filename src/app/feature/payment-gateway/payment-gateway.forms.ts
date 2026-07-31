import { FormControl } from '@angular/forms';
import { PaymentMethod } from '@domain/payment-gateway';

export interface OrganizationPaymentGatewayForm {
  provider: FormControl<string>;
  publicKey: FormControl<string>;
  secretKey: FormControl<string>;
  webhookUsername: FormControl<string | null>;
  webhookSecret: FormControl<string | null>;
  rsaId: FormControl<string | null>;
  rsaPublicKey: FormControl<string | null>;
  isActive: FormControl<boolean>;
  testMode: FormControl<boolean>;
  enabledPaymentMethods: FormControl<PaymentMethod[]>;
}
