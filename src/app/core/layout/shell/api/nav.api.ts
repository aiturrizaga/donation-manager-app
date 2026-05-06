import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Observable, shareReplay } from 'rxjs';
import { MenuItem } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NavApi {
  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #url = 'data/nav-items.json';

  private readonly navigationEnd$ = this.#router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
  );

  readonly title = toSignal(
    this.navigationEnd$.pipe(map(() => (this.#resolveDeepest()?.title as string) ?? '')),
    { initialValue: '' },
  );

  readonly breadcrumb = toSignal(this.navigationEnd$.pipe(map(() => this.#resolveBreadcrumb())), {
    initialValue: [] as MenuItem[],
  });

  getNavigationItems(): Observable<MenuItem[]> {
    return this.#http.get<MenuItem[]>(this.#url).pipe(shareReplay(1));
  }

  #resolveDeepest(): ActivatedRouteSnapshot | null {
    let route = this.#router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  #resolveBreadcrumb(): MenuItem[] {
    const items: MenuItem[] = [];
    let route: ActivatedRouteSnapshot | null = this.#router.routerState.snapshot.root;
    let url = '';

    while (route) {
      const segments = route.url.map((s) => s.path).join('/');
      const label = route.data?.['breadcrumb'] as string | undefined;

      if (segments) url += '/' + segments;

      if (label && label.trim() !== '') {
        const lastItem = items[items.length - 1];
        if (!lastItem || lastItem.label !== label) {
          items.push({ label, routerLink: url });
        }
      }

      route = route.firstChild;
    }

    return items;
  }
}
