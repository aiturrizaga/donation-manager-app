// Single source of truth for donation status labels/colors — every status the
// backend allows (chk_donations_status), so none falls through to its raw code.
type TagSeverity = 'success' | 'warn' | 'danger' | 'info' | 'secondary';

const DONATION_STATUS: Record<string, { label: string; severity: TagSeverity }> = {
  completed: { label: 'Completado', severity: 'success' },
  pending: { label: 'Pendiente', severity: 'warn' },
  processing: { label: 'Procesando', severity: 'info' },
  failed: { label: 'Fallido', severity: 'danger' },
  refunded: { label: 'Reembolsado', severity: 'secondary' },
  expired: { label: 'Expirado', severity: 'secondary' },
  cancelled: { label: 'Cancelado', severity: 'secondary' },
};

export const DONATION_STATUS_OPTIONS = Object.entries(DONATION_STATUS).map(([value, { label }]) => ({
  label,
  value,
}));

export function getDonationStatusLabel(status: string): string {
  return DONATION_STATUS[status]?.label ?? status;
}

export function getDonationStatusSeverity(status: string): TagSeverity {
  return DONATION_STATUS[status]?.severity ?? 'secondary';
}
