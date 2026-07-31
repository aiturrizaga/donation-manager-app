import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@shared/models';
import { PaymentGatewayApi } from '@shared/api/organization-payment-gateway.api';
import {
  OrganizationPaymentGateway,
  OrganizationPaymentGatewayCreateRequest,
  OrganizationPaymentGatewayTestResult,
  OrganizationPaymentGatewayUpdateRequest,
} from '@domain/payment-gateway';
import { environment } from '@env/environment';

/**
 * Reemplaza PaymentGatewayStore. `organizationId` es obligatorio (viene de
 * `SelectedOrganizationContext`, conectado una sola vez vía `connect()`) —
 * sin organización seleccionada el `httpResource` no dispara ningún request.
 */
@Injectable()
export class PaymentGatewaysListFacade {
  readonly #api = inject(PaymentGatewayApi);

  #organizationId: () => number | null = () => null;

  connect(organizationId: () => number | null): void {
    this.#organizationId = organizationId;
  }

  readonly #listResource = httpResource<ApiResponse<OrganizationPaymentGateway[]>>(() => {
    const orgId = this.#organizationId();
    if (!orgId) return undefined;
    return { url: `${environment.apiUrl}/v1/organizations/${orgId}/payment-gateways` };
  });

  readonly items = computed(() => (this.#listResource.hasValue() ? this.#listResource.value().data : []));
  readonly loading = this.#listResource.isLoading;
  readonly error = this.#listResource.error;

  reload(): void {
    this.#listResource.reload();
  }

  create(payload: OrganizationPaymentGatewayCreateRequest): Observable<OrganizationPaymentGateway> {
    return this.#api.create(this.#requireOrgId(), payload);
  }

  update(
    id: number,
    payload: OrganizationPaymentGatewayUpdateRequest,
  ): Observable<OrganizationPaymentGateway> {
    return this.#api.update(this.#requireOrgId(), id, payload);
  }

  test(id: number): Observable<OrganizationPaymentGatewayTestResult> {
    return this.#api.test(this.#requireOrgId(), id);
  }

  #requireOrgId(): number {
    const orgId = this.#organizationId();
    if (!orgId) throw new Error('No hay organización seleccionada.');
    return orgId;
  }
}
