export interface DonationTarget {
  id: number;
  organizationId: number;
  targetType: 'cause' | 'group' | 'campaign' | 'goal';
  name: string;
  description: string | null;
  bannerPath: string | null;
  amountGoal: number | null;
  amountRaised: number;
  startsAt: string | null;
  endsAt: string | null;
  status: 'active' | 'paused' | 'finished';
  isPublic: boolean;
  metadata: Record<string, unknown> | null;
}

export interface DonationTargetFilterParams {
  search?: string | null;
  targetType?: string | null;
  status?: string | null;
  isPublic?: boolean | null;
}

export interface DonationTargetCreateRequest {
  targetType: string;
  name: string;
  description?: string | null;
  amountGoal?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isPublic: boolean;
}

export interface DonationTargetUpdateRequest {
  name?: string;
  description?: string | null;
  amountGoal?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isPublic?: boolean;
}
