import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent, PageQuery } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import {
  Complaint,
  ComplaintCreateRequest,
  ComplaintFilterParams,
  ComplaintUpdateRequest,
} from '@domain/complaint';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ComplaintApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/complaints`;

  getAll(query: PageQuery, filters: ComplaintFilterParams): Observable<PageContent<Complaint>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http
      .get<ApiPagedResponse<Complaint>>(this.#base, { params })
      .pipe(map((r) => r.data));
  }

  getById(id: string): Observable<Complaint> {
    return this.#http.get<ApiResponse<Complaint>>(`${this.#base}/${id}`).pipe(map((r) => r.data));
  }

  getUnassignedCount(): Observable<number> {
    return this.#http
      .get<ApiResponse<number>>(`${this.#base}/unassigned-count`)
      .pipe(map((r) => r.data));
  }

  create(payload: ComplaintCreateRequest): Observable<Complaint> {
    return this.#http
      .post<ApiResponse<Complaint>>(this.#base, payload)
      .pipe(map((r) => r.data));
  }

  update(id: string, payload: ComplaintUpdateRequest): Observable<Complaint> {
    return this.#http
      .patch<ApiResponse<Complaint>>(`${this.#base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  delete(id: string): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${id}`);
  }
}
