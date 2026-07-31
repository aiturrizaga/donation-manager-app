import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models';
import {
  OrganizationPaymentGateway,
  OrganizationPaymentGatewayCreateRequest,
  OrganizationPaymentGatewayUpdateRequest,
  OrganizationPaymentGatewayTestResult,
} from '@domain/payment-gateway';
import { environment } from '@env/environment';

/**
 * Promovido a shared/api: lo consume `payment-gateway` (admin de
 * pasarelas por organización) y el editor de FormConfig de `donation-pages`
 * (para listar pasarelas activas de la organización al armar el formulario) — F5.
 */
@Injectable({ providedIn: 'root' })
export class PaymentGatewayApi {
  readonly #http = inject(HttpClient);

  #base(orgId: number): string {
    return `${environment.apiUrl}/v1/organizations/${orgId}/payment-gateways`;
  }

  getAll(orgId: number): Observable<OrganizationPaymentGateway[]> {
    return this.#http
      .get<ApiResponse<OrganizationPaymentGateway[]>>(this.#base(orgId))
      .pipe(map((r) => r.data));
  }

  create(
    orgId: number,
    payload: OrganizationPaymentGatewayCreateRequest,
  ): Observable<OrganizationPaymentGateway> {
    return this.#http
      .post<ApiResponse<OrganizationPaymentGateway>>(this.#base(orgId), payload)
      .pipe(map((r) => r.data));
  }

  update(
    orgId: number,
    id: number,
    payload: OrganizationPaymentGatewayUpdateRequest,
  ): Observable<OrganizationPaymentGateway> {
    return this.#http
      .patch<ApiResponse<OrganizationPaymentGateway>>(`${this.#base(orgId)}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  test(orgId: number, id: number): Observable<OrganizationPaymentGatewayTestResult> {
    return this.#http
      .post<ApiResponse<OrganizationPaymentGatewayTestResult>>(`${this.#base(orgId)}/${id}/test`, {})
      .pipe(map((r) => r.data));
  }
}
