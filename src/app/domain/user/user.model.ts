import { RoleSummary } from '@domain/rbac';

export interface User {
  id: number;
  partnerId: number;
  role: RoleSummary;
  isActive: boolean;
  hasAccount: boolean;
  metadata: Record<string, unknown> | null;
  partner: UserPartner;
}

export interface UserPartner {
  id: number;
  name: string;
  partnerType: string;
  email: string | null;
  phone: string | null;
  documentNumber: string | null;
  documentVerified: boolean;
}

export interface UserFilterParams {
  search?: string | null;
  isActive?: boolean | null;
  roleId?: number | null;
}

export interface UserCreateRequest {
  partnerType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  documentTypeId?: number | null;
  documentNumber?: string | null;
  roleId: number;
}

export interface UserUpdateRequest {
  roleId?: number;
  metadata?: Record<string, unknown> | null;
}
