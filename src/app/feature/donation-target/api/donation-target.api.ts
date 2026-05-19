import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent, PageQuery } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import {
  DonationTarget,
  DonationTargetCreateRequest,
  DonationTargetFilterParams,
  DonationTargetUpdateRequest,
} from '../models/donation-target.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DonationTargetApi {
  readonly #http = inject(HttpClient);

  #base(orgId: number): string {
    return `${environment.apiUrl}/v1/organizations/${orgId}/targets`;
  }

  getAll(
    orgId: number,
    query: PageQuery,
    filters: DonationTargetFilterParams,
  ): Observable<PageContent<DonationTarget>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http
      .get<ApiPagedResponse<DonationTarget>>(this.#base(orgId), { params })
      .pipe(map((r) => r.data));
  }

  create(orgId: number, payload: DonationTargetCreateRequest): Observable<DonationTarget> {
    return this.#http
      .post<ApiResponse<DonationTarget>>(this.#base(orgId), payload)
      .pipe(map((r) => r.data));
  }

  update(
    orgId: number,
    id: number,
    payload: DonationTargetUpdateRequest,
  ): Observable<DonationTarget> {
    return this.#http
      .patch<ApiResponse<DonationTarget>>(`${this.#base(orgId)}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  activate(orgId: number, id: number): Observable<DonationTarget> {
    return this.#http
      .patch<ApiResponse<DonationTarget>>(`${this.#base(orgId)}/${id}/activate`, {})
      .pipe(map((r) => r.data));
  }

  pause(orgId: number, id: number): Observable<DonationTarget> {
    return this.#http
      .patch<ApiResponse<DonationTarget>>(`${this.#base(orgId)}/${id}/pause`, {})
      .pipe(map((r) => r.data));
  }

  finish(orgId: number, id: number): Observable<DonationTarget> {
    return this.#http
      .patch<ApiResponse<DonationTarget>>(`${this.#base(orgId)}/${id}/finish`, {})
      .pipe(map((r) => r.data));
  }

  delete(orgId: number, id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base(orgId)}/${id}`);
  }
}
