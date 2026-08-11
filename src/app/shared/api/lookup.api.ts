import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  Lookup,
  LookupCreateRequest,
  LookupItem,
  LookupItemCreateRequest,
  LookupItemUpdateRequest,
  LookupUpdateRequest,
} from '@domain/lookup';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class LookupApi {
  readonly #http = inject(HttpClient);
  readonly #base = environment.apiUrl;

  getAll(): Observable<Lookup[]> {
    return this.#http
      .get<ApiResponse<Lookup[]>>(`${this.#base}/v1/lookups`)
      .pipe(map((r) => r.data));
  }

  getById(id: number): Observable<Lookup> {
    return this.#http
      .get<ApiResponse<Lookup>>(`${this.#base}/v1/lookups/${id}`)
      .pipe(map((r) => r.data));
  }

  getByCode(code: string): Observable<Lookup> {
    return this.#http
      .get<ApiResponse<Lookup>>(`${this.#base}/v1/lookups/by-code/${code}`)
      .pipe(map((r) => r.data));
  }

  create(payload: LookupCreateRequest): Observable<Lookup> {
    return this.#http
      .post<ApiResponse<Lookup>>(`${this.#base}/v1/lookups`, payload)
      .pipe(map((r) => r.data));
  }

  update(id: number, payload: LookupUpdateRequest): Observable<Lookup> {
    return this.#http
      .patch<ApiResponse<Lookup>>(`${this.#base}/v1/lookups/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  delete(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/v1/lookups/${id}`);
  }

  createItem(lookupId: number, payload: LookupItemCreateRequest): Observable<LookupItem> {
    return this.#http
      .post<ApiResponse<LookupItem>>(`${this.#base}/v1/lookups/${lookupId}/items`, payload)
      .pipe(map((r) => r.data));
  }

  updateItem(lookupId: number, itemId: number, payload: LookupItemUpdateRequest): Observable<LookupItem> {
    return this.#http
      .patch<ApiResponse<LookupItem>>(`${this.#base}/v1/lookups/${lookupId}/items/${itemId}`, payload)
      .pipe(map((r) => r.data));
  }

  deleteItem(lookupId: number, itemId: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/v1/lookups/${lookupId}/items/${itemId}`);
  }
}
