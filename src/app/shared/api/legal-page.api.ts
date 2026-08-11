import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent, PageQuery } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import {
  LegalPage,
  LegalPageCreateRequest,
  LegalPageFilterParams,
  LegalPageUpdateRequest,
} from '@domain/legal-page';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class LegalPageApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/legal-pages`;

  getAll(query: PageQuery, filters: LegalPageFilterParams): Observable<PageContent<LegalPage>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http
      .get<ApiPagedResponse<LegalPage>>(this.#base, { params })
      .pipe(map((r) => r.data));
  }

  getById(id: number): Observable<LegalPage> {
    return this.#http.get<ApiResponse<LegalPage>>(`${this.#base}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: LegalPageCreateRequest): Observable<LegalPage> {
    return this.#http
      .post<ApiResponse<LegalPage>>(this.#base, payload)
      .pipe(map((r) => r.data));
  }

  update(id: number, payload: LegalPageUpdateRequest): Observable<LegalPage> {
    return this.#http
      .patch<ApiResponse<LegalPage>>(`${this.#base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  delete(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${id}`);
  }
}
