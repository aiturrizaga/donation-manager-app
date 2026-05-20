import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models';
import {
  PaymentGateway,
  PaymentGatewayCreateRequest,
  PaymentGatewayUpdateRequest,
  PaymentGatewayTestResult,
} from '../models/payment-gateway.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class PaymentGatewayApi {
  readonly #http = inject(HttpClient);

  #base(orgId: number): string {
    return `${environment.apiUrl}/v1/organizations/${orgId}/payment-gateways`;
  }

  getAll(orgId: number): Observable<PaymentGateway[]> {
    return this.#http
      .get<ApiResponse<PaymentGateway[]>>(this.#base(orgId))
      .pipe(map((r) => r.data));
  }

  create(orgId: number, payload: PaymentGatewayCreateRequest): Observable<PaymentGateway> {
    return this.#http
      .post<ApiResponse<PaymentGateway>>(this.#base(orgId), payload)
      .pipe(map((r) => r.data));
  }

  update(
    orgId: number,
    id: number,
    payload: PaymentGatewayUpdateRequest,
  ): Observable<PaymentGateway> {
    return this.#http
      .patch<ApiResponse<PaymentGateway>>(`${this.#base(orgId)}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  test(orgId: number, id: number): Observable<PaymentGatewayTestResult> {
    return this.#http
      .post<ApiResponse<PaymentGatewayTestResult>>(`${this.#base(orgId)}/${id}/test`, {})
      .pipe(map((r) => r.data));
  }
}
