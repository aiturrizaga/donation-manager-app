import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent } from '@shared/models/api-response.model';
import { PageQuery } from '@shared/models/pagination.model';
import { buildHttpParams } from '@shared/utils/http.util';
import {
  Organization,
  OrganizationCreateRequest,
  OrganizationFilterParams,
  OrganizationUpdateRequest,
} from '@domain/organization';
import { environment } from '@env/environment';

/**
 * Promovido a shared/api porque se consume desde 4+ features
 * (organizations, donation-pages, donation-form, payment-gateway, donation-target) — F19/F5.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/organizations`;

  getAll(
    query: PageQuery,
    filters: OrganizationFilterParams,
  ): Observable<PageContent<Organization>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http
      .get<ApiPagedResponse<Organization>>(this.#base, { params })
      .pipe(map((r) => r.data));
  }

  getById(id: number): Observable<Organization> {
    return this.#http
      .get<ApiResponse<Organization>>(`${this.#base}/${id}`)
      .pipe(map((r) => r.data));
  }

  create(payload: OrganizationCreateRequest): Observable<Organization> {
    return this.#http
      .post<ApiResponse<Organization>>(this.#base, payload)
      .pipe(map((r) => r.data));
  }

  update(id: number, payload: OrganizationUpdateRequest): Observable<Organization> {
    // Confirmed live 2026-07-29: the backend only ever exposed this as
    // PATCH /v1/organizations/{id} (partial update) — calling it with PUT
    // 405'd, so every organization edit had been silently broken.
    return this.#http
      .patch<ApiResponse<Organization>>(`${this.#base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  activate(id: number): Observable<Organization> {
    return this.#http
      .patch<ApiResponse<Organization>>(`${this.#base}/${id}/activate`, {})
      .pipe(map((r) => r.data));
  }

  deactivate(id: number): Observable<Organization> {
    return this.#http
      .patch<ApiResponse<Organization>>(`${this.#base}/${id}/deactivate`, {})
      .pipe(map((r) => r.data));
  }

  delete(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${id}`);
  }

  uploadLogo(id: number, file: File): Observable<Organization> {
    const formData = new FormData();
    formData.append('file', file);
    return this.#http
      .post<ApiResponse<Organization>>(`${this.#base}/${id}/logo`, formData)
      .pipe(map((r) => r.data));
  }
}
