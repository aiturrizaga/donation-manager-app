// Single source of truth for donation target type labels/options — was
// duplicated as an inline map in 4+ components (save-donation-target-dlg,
// donation-target-filters, donation-target-data-view, page-tab-targets,
// assign-target-dlg). Backend value stays 'group' for compatibility; only
// the Spanish label shown to admins changed from "Grupo" to "Labor".
export const TARGET_TYPE_OPTIONS = [
  { label: 'Causa', value: 'cause' },
  { label: 'Labor', value: 'group' },
  { label: 'Campaña', value: 'campaign' },
  { label: 'Meta', value: 'goal' },
];

const TARGET_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  TARGET_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export function getTargetTypeLabel(type: string): string {
  return TARGET_TYPE_LABELS[type] ?? type;
}
