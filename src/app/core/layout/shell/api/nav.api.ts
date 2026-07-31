import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Observable, shareReplay } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { CurrentUserService } from '@core/services/current-user.service';

/** nav-items.json puede anotar cada entrada con un permiso o rol requerido
 * para mostrarla — ver CurrentUserService.hasPermission/hasRole. */
interface NavMenuItem extends MenuItem {
  permission?: string | string[];
  role?: string | string[];
  items?: NavMenuItem[];
}

@Injectable({ providedIn: 'root' })
export class NavApi {
  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #currentUser = inject(CurrentUserService);
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
    return this.#http.get<NavMenuItem[]>(this.#url).pipe(
      map((items) => this.#filterByAccess(items)),
      shareReplay(1),
    );
  }

  /** Descarta recursivamente los items sin permiso/rol, y cualquier grupo
   * padre que quede sin hijos visibles tras el filtrado. */
  #filterByAccess(items: NavMenuItem[]): MenuItem[] {
    return items.reduce<MenuItem[]>((acc, item) => {
      if (item.permission && !this.#currentUser.hasPermission(item.permission)) return acc;
      if (item.role && !this.#currentUser.hasRole(item.role)) return acc;

      if (item.items) {
        const children = this.#filterByAccess(item.items);
        if (children.length === 0) return acc;
        acc.push({ ...item, items: children });
        return acc;
      }

      acc.push(item);
      return acc;
    }, []);
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
      const rawLabel = route.data?.['breadcrumb'] as
        | string
        | ((route: ActivatedRouteSnapshot) => string | undefined)
        | undefined;
      const label = typeof rawLabel === 'function' ? rawLabel(route) : rawLabel;

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
