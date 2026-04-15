import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NavApi {
  private readonly http = inject(HttpClient);

  /**
   * Data source URL.
   *
   * Current: assets/data/nav-items.json (static asset, array of MenuItem groups)
   * Production: /api/v1/nav-items (FastAPI endpoint, same shape)
   *
   * To switch environments, replace only this string — no other changes needed.
   */
  private readonly url = 'data/nav-items.json';

  /**
   * Raw response: array of top-level MenuItem groups, each with a `label`
   * and an `items` array of leaf MenuItems.
   * Cached with shareReplay(1) — a single HTTP request per app lifecycle.
   */
  private getGroups(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.url).pipe(shareReplay(1));
  }

  /**
   * All nav groups with their items — consumed by SidebarComponent.
   * Shape: [{ label: 'Principal', items: [...] }, ...]
   * Excludes the 'Navegación móvil' group (bottom-nav only items).
   */
  getSidebarGroups(): Observable<MenuItem[]> {
    return this.getGroups().pipe(
      map((groups) => groups.filter((g) => g.label !== 'Navegación móvil')),
    );
  }
}
