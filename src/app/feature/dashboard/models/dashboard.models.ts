export interface DashboardStats {
  totalCollected: number;
  totalDonations: number;
  activeDonors: number;
  avgDonation: number;
  collectedDelta: number; // percentage vs previous period
  donationsDelta: number;
  donorsDelta: number;
  avgDonationDelta: number;
}

export interface RecentDonation {
  id: string;
  donorName: string;
  donorDocument: string;
  amount: number;
  currency: string;
  campaignName: string;
  frequency: 'one_time' | 'monthly' | 'quarterly';
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

export interface DonorsByMonth {
  month: string;
  newDonors: number;
  recurringDonors: number;
}

export interface DashboardFilters {
  organizationId: string | null;
  dateFrom: Date;
  dateTo: Date;
}

export interface OrganizationOption {
  id: string;
  name: string;
}
