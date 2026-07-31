export interface Permission {
  id: number;
  code: string;
  module: string;
  /** No se limita a CRUD — un módulo puede tener acciones propias (ej. 'refund', 'export'). */
  action: string;
  displayName: string;
  description: string | null;
}

export interface RoleSummary {
  id: number;
  name: string;
  displayName: string;
  isSystem: boolean;
}

export interface Role extends RoleSummary {
  description: string | null;
  permissions: Permission[];
  organizationIds: number[];
  userCount: number;
}

export interface RoleCreateRequest {
  name: string;
  displayName: string;
  description?: string | null;
}

export interface RoleUpdateRequest {
  name?: string;
  displayName?: string;
  description?: string | null;
}

export interface UserExtraGrants {
  userId: number;
  extraPermissions: Permission[];
  extraOrganizationIds: number[];
}

export interface MyPermissions {
  userId: number;
  role: RoleSummary;
  isSuperAdmin: boolean;
  permissions: string[];
  allOrganizations: boolean;
  organizationIds: number[];
}
