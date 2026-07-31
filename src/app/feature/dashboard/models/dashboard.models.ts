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
  donorDocument: string | null;
  amount: number;
  currency: string;
  campaignName: string;
  donationType: 'one_time' | 'recurring';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface DonorsByMonth {
  label: string;
  newDonors: number;
  recurringDonors: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  donorsByMonth: DonorsByMonth[];
  recentDonations: RecentDonation[];
}

export interface DashboardFilterParams {
  organizationIds?: number[] | null;
  dateFrom: string;
  dateTo: string;
}
