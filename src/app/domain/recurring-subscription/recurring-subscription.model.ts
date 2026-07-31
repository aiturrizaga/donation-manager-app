export interface RecurringSubscription {
  id: number;
  donationPageId: string;
  donorId: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'annual';
  status: 'active' | 'past_due' | 'paused' | 'cancelled';
  paymentGatewayId: number | null;
  providerPlanRef: string | null;
  providerSubscriptionRef: string | null;
  // NULL = indefinite (Mensual/Anual), billed until cancelled manually.
  // Set = a fixed-term monthly pledge (e.g. 3/6/9 meses).
  totalCycles: number | null;
  completedCycles: number;
  nextChargeDate: string | null;
  lastChargeDate: string | null;
  cancelledAt: string | null;
  cancelledBy: 'donor' | 'admin' | 'system' | null;
  pauseReason: string | null;
  createdAt: string;
  donor: SubscriptionDonor | null;
}

export interface SubscriptionDonor {
  id: string;
  name: string;
  email: string | null;
}

export interface SubscriptionFilterParams {
  donorId?: string | null;
  donationPageId?: string | null;
  organizationIds?: number[] | null;
  status?: string | null;
  frequency?: string | null;
}
