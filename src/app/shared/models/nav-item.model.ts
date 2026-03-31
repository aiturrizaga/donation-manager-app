export interface NavItem {
  /** Unique identifier — used as routerLink path */
  id: string;

  /** Display label */
  label: string;

  /** Tabler icon SVG path data — one or more <path> strings */
  iconPaths: string[];

  /** Router path (e.g. '/dashboard') */
  route: string;

  /** Optional badge count — shown as a pill on sidebar and bottom-nav */
  badge?: number;

  /** Optional subtitle — shown in the More page item cards */
  subtitle?: string;

  /** Navigation group label — used by sidebar to render section headers */
  group?: string;

  /** Whether this item appears in the bottom nav (max 4 items) */
  inBottomNav?: boolean;

  /**
   * Roles allowed to see this item.
   * Empty array means visible to all roles.
   * Reserved for future RBAC filtering — not yet enforced.
   */
  roles?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
