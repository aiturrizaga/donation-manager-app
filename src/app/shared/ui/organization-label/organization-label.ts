import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

/** Fields shared by every organization summary the API returns. */
export interface OrganizationLabelData {
  alias: string;
  legalName: string;
  tradeName: string | null;
}

/**
 * Shows an organization by its alias (unique and stable, unlike the trade
 * name) with "LEGAL NAME · TRADE NAME" in a tooltip, for table cells.
 */
@Component({
  selector: 'app-organization-label',
  imports: [Tooltip],
  template: `
    @if (organization(); as org) {
      <span [pTooltip]="tooltip()" tooltipPosition="top" class="cursor-default">{{ org.alias }}</span>
    } @else {
      —
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationLabel {
  readonly organization = input<OrganizationLabelData | null | undefined>(null);

  protected readonly tooltip = computed(() => {
    const org = this.organization();
    if (!org) return '';
    const tradeName = org.tradeName?.trim();
    return tradeName && tradeName !== org.legalName ? `${org.legalName} · ${tradeName}` : org.legalName;
  });
}
