import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@shared/models';
import { EmailSettingsApi } from '@shared/api/organization-email-settings.api';
import {
  OrganizationEmailSettings,
  OrganizationEmailSettingsTestResult,
  OrganizationEmailSettingsUpsertRequest,
} from '@domain/email-settings';
import { environment } from '@env/environment';

/**
 * Misma idea que PaymentGatewaysListFacade: `organizationId` viene de
 * `SelectedOrganizationContext` (conectado una sola vez vía `connect()`).
 * A diferencia de pasarelas, acá hay a lo más una configuración por
 * organización — `settings()` es `null` si la organización todavía usa el
 * SMTP por defecto de la plataforma.
 */
@Injectable()
export class EmailSettingsFacade {
  readonly #api = inject(EmailSettingsApi);

  #organizationId: () => number | null = () => null;

  connect(organizationId: () => number | null): void {
    this.#organizationId = organizationId;
  }

  readonly #resource = httpResource<ApiResponse<OrganizationEmailSettings | null>>(() => {
    const orgId = this.#organizationId();
    if (!orgId) return undefined;
    return { url: `${environment.apiUrl}/v1/organizations/${orgId}/email-settings` };
  });

  readonly settings = computed(() => (this.#resource.hasValue() ? this.#resource.value().data : null));
  readonly loading = this.#resource.isLoading;
  readonly error = this.#resource.error;

  reload(): void {
    this.#resource.reload();
  }

  upsert(payload: OrganizationEmailSettingsUpsertRequest): Observable<OrganizationEmailSettings> {
    return this.#api.upsert(this.#requireOrgId(), payload);
  }

  delete(): Observable<void> {
    return this.#api.delete(this.#requireOrgId());
  }

  test(recipientEmail?: string | null): Observable<OrganizationEmailSettingsTestResult> {
    return this.#api.test(this.#requireOrgId(), recipientEmail);
  }

  #requireOrgId(): number {
    const orgId = this.#organizationId();
    if (!orgId) throw new Error('No hay organización seleccionada.');
    return orgId;
  }
}
