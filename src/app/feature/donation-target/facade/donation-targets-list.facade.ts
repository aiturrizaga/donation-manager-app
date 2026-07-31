import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiPagedResponse } from '@shared/models/api-response.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { DonationTarget } from '@domain/donation-target';
import { DonationTargetApi } from '@shared/api/donation-target.api';
import { environment } from '@env/environment';

interface DonationTargetsListCriteria {
  organizationId: number | null;
  search: string | null;
  targetType: string | null;
  status: string | null;
  page: number;
  size: number;
}

const DEFAULT_CRITERIA: DonationTargetsListCriteria = {
  organizationId: null,
  search: null,
  targetType: null,
  status: null,
  page: 1,
  size: 50,
};

/**
 * Reemplaza DonationTargetStore. `organizationId` es obligatorio (la API
 * cuelga de `/organizations/{orgId}/targets`, no es un filtro) — cuando es
 * `null` el `httpResource` retorna `undefined` en su config y no dispara
 * ningún request (comportamiento estándar de `resource`/`httpResource`).
 */
@Injectable()
export class DonationTargetsListFacade {
  readonly #api = inject(DonationTargetApi);

  #criteria: () => DonationTargetsListCriteria = () => DEFAULT_CRITERIA;

  connect(criteria: () => DonationTargetsListCriteria): void {
    this.#criteria = criteria;
  }

  readonly #listResource = httpResource<ApiPagedResponse<DonationTarget>>(() => {
    const c = this.#criteria();
    if (!c.organizationId) return undefined;
    return {
      url: `${environment.apiUrl}/v1/organizations/${c.organizationId}/targets`,
      params: buildHttpParams({
        page: c.page,
        size: c.size,
        search: c.search,
        targetType: c.targetType,
        status: c.status,
      }),
    };
  });

  readonly items = computed(() => (this.#listResource.hasValue() ? this.#listResource.value().data.items : []));
  readonly total = computed(() => (this.#listResource.hasValue() ? this.#listResource.value().data.total : 0));
  readonly pages = computed(() => (this.#listResource.hasValue() ? this.#listResource.value().data.pages : 0));
  readonly loading = this.#listResource.isLoading;
  readonly error = this.#listResource.error;
  readonly isEmpty = computed(() => !this.loading() && this.items().length === 0);
  readonly hasPagination = computed(() => this.pages() > 1);
  readonly first = computed(() => (this.#criteria().page - 1) * this.#criteria().size);

  readonly emptyReason = computed((): 'no-records' | 'filtered' | 'search' | null => {
    if (this.loading() || this.items().length > 0) return null;
    const c = this.#criteria();
    if (c.search) return 'search';
    if (c.targetType || c.status) return 'filtered';
    return 'no-records';
  });

  reload(): void {
    this.#listResource.reload();
  }

  setStatus(target: DonationTarget, status: 'active' | 'paused' | 'finished'): Observable<DonationTarget | null> {
    const orgId = this.#criteria().organizationId;
    if (!orgId) return of(null);
    return status === 'active'
      ? this.#api.activate(orgId, target.id)
      : status === 'paused'
        ? this.#api.pause(orgId, target.id)
        : this.#api.finish(orgId, target.id);
  }

  remove(id: number): Observable<void | null> {
    const orgId = this.#criteria().organizationId;
    if (!orgId) return of(null);
    return this.#api.delete(orgId, id);
  }
}
