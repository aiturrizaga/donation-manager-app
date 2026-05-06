import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponseModel, PageContent } from '@shared/models/api-response.model';
import { PageQuery } from '@shared/models/pagination.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { Organization, OrganizationFilterParams } from '../models/organization.model';
import { environment } from '@env/environment';

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
      .get<ApiResponseModel<Organization>>(`${this.#base}/${id}`)
      .pipe(map((r) => r.data));
  }

  create(payload: any): Observable<ApiResponseModel<Organization>> {
    return this.#http.post<ApiResponseModel<Organization>>(this.#base, payload);
  }

  update(id: number, payload: any): Observable<ApiResponseModel<Organization>> {
    return this.#http.put<ApiResponseModel<Organization>>(`${this.#base}/${id}`, payload);
  }

  activate(id: number): Observable<Organization> {
    return this.#http
      .patch<ApiResponseModel<Organization>>(`${this.#base}/${id}/activate`, {})
      .pipe(map((r) => r.data));
  }

  deactivate(id: number): Observable<Organization> {
    return this.#http
      .patch<ApiResponseModel<Organization>>(`${this.#base}/${id}/deactivate`, {})
      .pipe(map((r) => r.data));
  }

  delete(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${id}`);
  }
}
