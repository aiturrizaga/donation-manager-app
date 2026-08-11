export interface LookupItem {
  id: number;
  lookupId: number;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Lookup {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  items: LookupItem[];
}

export interface LookupCreateRequest {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface LookupUpdateRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface LookupItemCreateRequest {
  value: string;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface LookupItemUpdateRequest {
  value?: string;
  label?: string;
  sortOrder?: number;
  isActive?: boolean;
}
