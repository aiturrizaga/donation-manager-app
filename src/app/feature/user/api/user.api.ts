import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent, PageQuery } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import {
  TemporaryPasswordResponse,
  User,
  UserCreatedResponse,
  UserCreateRequest,
  UserFilterParams,
  UserUpdateRequest,
} from '@domain/user';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class UserApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/users`;

  getAll(query: PageQuery, filters: UserFilterParams): Observable<PageContent<User>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http.get<ApiPagedResponse<User>>(this.#base, { params }).pipe(map((r) => r.data));
  }

  getById(id: number): Observable<User> {
    return this.#http.get<ApiResponse<User>>(`${this.#base}/${id}`).pipe(map((r) => r.data));
  }

  create(payload: UserCreateRequest): Observable<UserCreatedResponse> {
    return this.#http
      .post<ApiResponse<UserCreatedResponse>>(this.#base, payload)
      .pipe(map((r) => r.data));
  }

  update(id: number, payload: UserUpdateRequest): Observable<User> {
    return this.#http.patch<ApiResponse<User>>(`${this.#base}/${id}`, payload).pipe(map((r) => r.data));
  }

  activate(id: number): Observable<User> {
    return this.#http
      .patch<ApiResponse<User>>(`${this.#base}/${id}/activate`, {})
      .pipe(map((r) => r.data));
  }

  deactivate(id: number): Observable<User> {
    return this.#http
      .patch<ApiResponse<User>>(`${this.#base}/${id}/deactivate`, {})
      .pipe(map((r) => r.data));
  }

  resetPassword(id: number): Observable<TemporaryPasswordResponse> {
    return this.#http
      .post<ApiResponse<TemporaryPasswordResponse>>(`${this.#base}/${id}/reset-password`, {})
      .pipe(map((r) => r.data));
  }

  delete(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${id}`);
  }
}
