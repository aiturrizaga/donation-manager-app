import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NavItem, NavGroup } from '../../../../shared/models/nav-item.model';

@Injectable({ providedIn: 'root' })
export class NavApi {
  private readonly http = inject(HttpClient);

  /**
   * Data source for nav items.
   *
   * Current: assets/data/nav-items.json (served as a static asset)
   * Production: /api/v1/nav-items (FastAPI endpoint, same NavItem[] shape)
   *
   * To switch, replace the URL string below — no other changes needed.
   */
  private readonly url = 'data/nav-items.json';

  /**
   * Fetches all nav items from the data source.
   * shareReplay(1) caches the last emission, so multiple subscribers
   * (sidebar, bottom-nav) share a single HTTP request per app lifecycle.
   */
  private getItems(): Observable<NavItem[]> {
    return this.http.get<NavItem[]>(this.url).pipe(shareReplay(1));
  }

  /**
   * Items grouped by their `group` field — consumed by SidebarComponent.
   * Items without a group (e.g. the 'más' bottom-nav placeholder) are excluded.
   */
  getSidebarGroups(): Observable<NavGroup[]> {
    return this.getItems().pipe(
      map((items) => {
        const grouped = new Map<string, NavItem[]>();

        for (const item of items) {
          if (!item.group) continue;
          if (!grouped.has(item.group)) grouped.set(item.group, []);
          grouped.get(item.group)!.push(item);
        }

        return Array.from(grouped.entries()).map(([label, items]) => ({
          label,
          items,
        }));
      }),
    );
  }

  /**
   * Flat list of items for the bottom nav — consumed by BottomNavComponent.
   * Filtered by inBottomNav === true, hard-capped at 4 items.
   */
  getBottomNavItems(): Observable<NavItem[]> {
    return this.getItems().pipe(map((items) => items.filter((i) => i.inBottomNav).slice(0, 4)));
  }

  /**
   * Items for the /mas page — everything with a group that is not
   * flagged for the bottom nav, returned grouped for section rendering.
   */
  getMorePageGroups(): Observable<NavGroup[]> {
    return this.getItems().pipe(
      map((items) => {
        const eligible = items.filter((i) => i.group && !i.inBottomNav);
        const grouped = new Map<string, NavItem[]>();

        for (const item of eligible) {
          if (!grouped.has(item.group!)) grouped.set(item.group!, []);
          grouped.get(item.group!)!.push(item);
        }

        return Array.from(grouped.entries()).map(([label, items]) => ({
          label,
          items,
        }));
      }),
    );
  }
}
