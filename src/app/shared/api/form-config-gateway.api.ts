import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models';
import { FormConfigGateway, FormConfigGatewayAddRequest } from '@domain/donation-page';
import { environment } from '@env/environment';

/** Promovido a shared/api junto con el editor de FormConfig (F5). */
@Injectable({ providedIn: 'root' })
export class FormConfigGatewayApi {
  readonly #http = inject(HttpClient);

  #base(formConfigId: number): string {
    return `${environment.apiUrl}/v1/form-configs/${formConfigId}/gateways`;
  }

  getAll(formConfigId: number): Observable<FormConfigGateway[]> {
    return this.#http
      .get<ApiResponse<FormConfigGateway[]>>(this.#base(formConfigId))
      .pipe(map((r) => r.data));
  }

  add(formConfigId: number, payload: FormConfigGatewayAddRequest): Observable<FormConfigGateway> {
    return this.#http
      .post<ApiResponse<FormConfigGateway>>(this.#base(formConfigId), payload)
      .pipe(map((r) => r.data));
  }

  setDefault(formConfigId: number, gatewayId: number): Observable<FormConfigGateway> {
    return this.#http
      .patch<
        ApiResponse<FormConfigGateway>
      >(`${this.#base(formConfigId)}/${gatewayId}/set-default`, {})
      .pipe(map((r) => r.data));
  }

  remove(formConfigId: number, gatewayId: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base(formConfigId)}/${gatewayId}`);
  }
}
