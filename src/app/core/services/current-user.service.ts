import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MyPermissions } from '@domain/rbac';
import { RbacApi } from '@shared/api/rbac.api';

/**
 * Efectivos permisos/rol/organizaciones del usuario actual — se carga una vez
 * por sesión desde GET /v1/users/me/permissions (ver authGuard, que dispara
 * load() antes de activar cualquier ruta del shell). Es la única fuente de
 * verdad para las directivas *appHasRole/*appHasPermission y para el
 * filtrado del menú de navegación.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  readonly #rbacApi = inject(RbacApi);
  readonly #state = signal<MyPermissions | null>(null);
  readonly #permissionSet = computed(() => new Set(this.#state()?.permissions ?? []));

  readonly loaded = computed(() => this.#state() !== null);
  readonly role = computed(() => this.#state()?.role ?? null);
  readonly isSuperAdmin = computed(() => this.#state()?.isSuperAdmin ?? false);
  readonly organizationIds = computed(() => this.#state()?.organizationIds ?? []);
  readonly allOrganizations = computed(() => this.#state()?.allOrganizations ?? false);

  load(): Observable<MyPermissions> {
    return this.#rbacApi.getMyPermissions().pipe(tap((permissions) => this.#state.set(permissions)));
  }

  clear(): void {
    this.#state.set(null);
  }

  hasRole(role: string | string[]): boolean {
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(this.role()?.name ?? '');
  }

  hasPermission(code: string | string[]): boolean {
    if (this.isSuperAdmin()) return true;
    const codes = Array.isArray(code) ? code : [code];
    return codes.some((c) => this.#permissionSet().has(c));
  }
}
