import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, map, Observable, shareReplay } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class NavApi {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  /**
   * Data source URL.
   *
   * Current: data/nav-items.json (static asset, array of MenuItem groups)
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
  getNavigationItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.url).pipe(shareReplay(1));
  }

  /**
   * Emits the title of the deepest active child route after every completed
   * navigation. Reads the `title` field defined per route in app.routes.ts.
   *
   * Why not startWith(null):
   * At injection time the activated route snapshot tree is not yet fully
   * resolved — snapshot.title is undefined and causes a read error.
   * Using initialValue in toSignal() covers the empty state before the
   * first NavigationEnd fires, with no risk of reading an incomplete snapshot.
   */
  private readonly title$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(() => this.resolveTitle(this.activatedRoute)),
  );

  /** Reactive signal — use as title() in templates */
  readonly title = toSignal(this.title$, { initialValue: '' });

  /**
   * Walks the activated route tree from root to the deepest child.
   * The deepest child is always the currently rendered route, which
   * holds the correct title for the active view.
   *
   * Guards against missing snapshots to be safe during route transitions.
   */
  private resolveTitle(route: ActivatedRoute): string {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return (current.snapshot?.title as string) ?? '';
  }
}
