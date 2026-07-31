import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models';
import { Partner, PartnerUpdateRequest } from '@domain/partner';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class PartnerApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/partners`;

  getById(id: number): Observable<Partner> {
    return this.#http.get<ApiResponse<Partner>>(`${this.#base}/${id}`).pipe(map((r) => r.data));
  }

  update(id: number, payload: PartnerUpdateRequest): Observable<Partner> {
    return this.#http
      .patch<ApiResponse<Partner>>(`${this.#base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }
}
