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
