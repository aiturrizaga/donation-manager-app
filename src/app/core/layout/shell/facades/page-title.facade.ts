import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PageTitleFacade {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

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
