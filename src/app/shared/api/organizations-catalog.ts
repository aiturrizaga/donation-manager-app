import { Injectable, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ApiPagedResponse } from '@shared/models/api-response.model';
import { Organization } from '@domain/organization';
import { environment } from '@env/environment';

/**
 * Catálogo de organizaciones cacheado y compartido (F19): las organizaciones
 * cambian con muy baja frecuencia, así que se cargan una sola vez por sesión
 * de la app en vez de que cada feature (donation-page, donation-form, ...)
 * repita su propio `OrganizationApi.getAll(...)`.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationsCatalog {
  readonly #resource = httpResource<ApiPagedResponse<Organization>>(() => ({
    url: `${environment.apiUrl}/v1/organizations`,
    params: { page: 1, size: 100 },
  }));

  readonly items = computed(() =>
    (this.#resource.hasValue() ? this.#resource.value().data.items : []).map((o) => ({
      ...o,
      tradeName: o.tradeName ?? o.legalName,
    })),
  );
  readonly loading = this.#resource.isLoading;
  readonly error = this.#resource.error;

  reload(): void {
    this.#resource.reload();
  }
}
