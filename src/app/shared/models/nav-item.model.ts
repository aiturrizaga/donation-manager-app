import { MenuItem } from 'primeng/api';

/**
 * Extends PrimeNG's MenuItem with project-specific fields.
 * These fields are valid because MenuItem has [key: string]: any.
 *
 * Using a named interface instead of inline [key: string] access
 * gives type safety when reading these fields in NavApi and components.
 */
export interface NavItem extends MenuItem {
  /**
   * Whether this item appears in the mobile bottom nav.
   * Max 4 items are rendered — enforced by NavApi.getBottomNavItems().
   */
  inBottomNav?: boolean;

  /**
   * Short description shown in the /mas page item cards.
   * Maps to PrimeNG's built-in `title` field for tooltip use,
   * but also used as subtitle text in custom layouts.
   */
  subtitle?: string;
}

/**
 * A nav group as returned by the API and rendered by the sidebar.
 * Shape matches PrimeNG's top-level MenuItem with nested items.
 */
export interface NavGroup {
  label: string;
  items: NavItem[];
}
