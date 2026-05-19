import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent, PageQuery } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import { Donor, DonorCreateRequest, DonorFilterParams } from '../models/donor.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DonorApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/donors`;

  getAll(query: PageQuery, filters: DonorFilterParams): Observable<PageContent<Donor>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http.get<ApiPagedResponse<Donor>>(this.#base, { params }).pipe(map((r) => r.data));
  }

  getById(id: string): Observable<Donor> {
    return this.#http.get<ApiResponse<Donor>>(`${this.#base}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: DonorCreateRequest): Observable<Donor> {
    return this.#http
      .post<ApiResponse<Donor>>(`${this.#base}/with-partner`, payload)
      .pipe(map((r) => r.data));
  }

  activate(id: string): Observable<Donor> {
    return this.#http
      .patch<ApiResponse<Donor>>(`${this.#base}/${id}/activate`, {})
      .pipe(map((r) => r.data));
  }

  deactivate(id: string): Observable<Donor> {
    return this.#http
      .patch<ApiResponse<Donor>>(`${this.#base}/${id}/deactivate`, {})
      .pipe(map((r) => r.data));
  }

  delete(id: string): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${id}`);
  }
}
