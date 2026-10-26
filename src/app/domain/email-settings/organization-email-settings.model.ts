export interface OrganizationEmailSettings {
  id: number;
  organizationId: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  fromName: string;
  fromEmail: string;
  useTls: boolean;
  isVerified: boolean;
  lastTestedAt: string | null;
}

export interface OrganizationEmailSettingsUpsertRequest {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  // Write-only — the API never returns it. Omit to keep the currently
  // stored password when updating an existing configuration.
  smtpPassword?: string | null;
  fromName: string;
  fromEmail: string;
  useTls: boolean;
}

export interface OrganizationEmailSettingsTestResult {
  success: boolean;
  message: string;
}
