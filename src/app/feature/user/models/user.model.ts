import { FormControl } from '@angular/forms';

export interface User {
  id: number;
  partnerId: number;
  role: 'super_admin' | 'admin';
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
}

export interface UserCreateRequest {
  partnerType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  documentTypeId?: number | null;
  documentNumber?: string | null;
  role: 'super_admin' | 'admin';
}

export interface UserCreateForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string | null>;
  documentNumber: FormControl<string | null>;
  role: FormControl<'super_admin' | 'admin'>;
}
