import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  MyPermissions,
  Permission,
  Role,
  RoleCreateRequest,
  RoleUpdateRequest,
  UserExtraGrants,
} from '@domain/rbac';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class RbacApi {
  readonly #http = inject(HttpClient);
  readonly #base = environment.apiUrl;

  getMyPermissions(): Observable<MyPermissions> {
    return this.#http
      .get<ApiResponse<MyPermissions>>(`${this.#base}/v1/users/me/permissions`)
      .pipe(map((r) => r.data));
  }

  getRoles(): Observable<Role[]> {
    return this.#http
      .get<ApiResponse<Role[]>>(`${this.#base}/v1/roles`)
      .pipe(map((r) => r.data));
  }

  getRole(id: number): Observable<Role> {
    return this.#http
      .get<ApiResponse<Role>>(`${this.#base}/v1/roles/${id}`)
      .pipe(map((r) => r.data));
  }

  createRole(payload: RoleCreateRequest): Observable<Role> {
    return this.#http
      .post<ApiResponse<Role>>(`${this.#base}/v1/roles`, payload)
      .pipe(map((r) => r.data));
  }

  updateRole(id: number, payload: RoleUpdateRequest): Observable<Role> {
    return this.#http
      .patch<ApiResponse<Role>>(`${this.#base}/v1/roles/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  deleteRole(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/v1/roles/${id}`);
  }

  setRolePermissions(id: number, permissionIds: number[]): Observable<Role> {
    return this.#http
      .put<ApiResponse<Role>>(`${this.#base}/v1/roles/${id}/permissions`, { permissionIds })
      .pipe(map((r) => r.data));
  }

  setRoleOrganizations(id: number, organizationIds: number[]): Observable<Role> {
    return this.#http
      .put<ApiResponse<Role>>(`${this.#base}/v1/roles/${id}/organizations`, { organizationIds })
      .pipe(map((r) => r.data));
  }

  getPermissionsCatalog(): Observable<Permission[]> {
    return this.#http
      .get<ApiResponse<Permission[]>>(`${this.#base}/v1/permissions`)
      .pipe(map((r) => r.data));
  }

  getUserExtraGrants(userId: number): Observable<UserExtraGrants> {
    return this.#http
      .get<ApiResponse<UserExtraGrants>>(`${this.#base}/v1/users/${userId}/extra-grants`)
      .pipe(map((r) => r.data));
  }

  setUserExtraPermissions(userId: number, permissionIds: number[]): Observable<UserExtraGrants> {
    return this.#http
      .put<ApiResponse<UserExtraGrants>>(
        `${this.#base}/v1/users/${userId}/extra-grants/permissions`,
        { permissionIds },
      )
      .pipe(map((r) => r.data));
  }

  setUserExtraOrganizations(userId: number, organizationIds: number[]): Observable<UserExtraGrants> {
    return this.#http
      .put<ApiResponse<UserExtraGrants>>(
        `${this.#base}/v1/users/${userId}/extra-grants/organizations`,
        { organizationIds },
      )
      .pipe(map((r) => r.data));
  }
}
