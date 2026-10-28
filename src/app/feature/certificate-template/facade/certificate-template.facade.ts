import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@shared/models';
import { CertificateTemplateApi } from '@shared/api/organization-certificate-template.api';
import {
  CertificateTemplate,
  CertificateTemplateUpsertRequest,
  CertificateVariable,
} from '@domain/certificate-template';
import { environment } from '@env/environment';

/** Mismo patrón que EmailSettingsFacade — a lo más una plantilla por organización. */
@Injectable()
export class CertificateTemplateFacade {
  readonly #api = inject(CertificateTemplateApi);

  #organizationId: () => number | null = () => null;

  connect(organizationId: () => number | null): void {
    this.#organizationId = organizationId;
  }

  readonly #resource = httpResource<ApiResponse<CertificateTemplate | null>>(() => {
    const orgId = this.#organizationId();
    if (!orgId) return undefined;
    return { url: `${environment.apiUrl}/v1/organizations/${orgId}/certificate-template` };
  });

  readonly template = computed(() => (this.#resource.hasValue() ? this.#resource.value().data : null));
  readonly loading = this.#resource.isLoading;
  readonly error = this.#resource.error;

  readonly #variablesResource = httpResource<ApiResponse<CertificateVariable[]>>(() => {
    const orgId = this.#organizationId();
    if (!orgId) return undefined;
    return { url: `${environment.apiUrl}/v1/organizations/${orgId}/certificate-template/variables` };
  });

  readonly variables = computed(() =>
    this.#variablesResource.hasValue() ? this.#variablesResource.value().data : [],
  );

  reload(): void {
    this.#resource.reload();
  }

  upsert(payload: CertificateTemplateUpsertRequest): Observable<CertificateTemplate> {
    return this.#api.upsert(this.#requireOrgId(), payload);
  }

  delete(): Observable<void> {
    return this.#api.delete(this.#requireOrgId());
  }

  previewPdf(): Observable<Blob> {
    return this.#api.previewPdf(this.#requireOrgId());
  }

  #requireOrgId(): number {
    const orgId = this.#organizationId();
    if (!orgId) throw new Error('No hay organización seleccionada.');
    return orgId;
  }
}
