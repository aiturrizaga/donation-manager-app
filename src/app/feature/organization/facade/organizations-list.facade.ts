import { Injectable, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ApiPagedResponse } from '@shared/models/api-response.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { Organization } from '@domain/organization';
import { environment } from '@env/environment';

interface OrganizationsListCriteria {
  search: string | null;
  active: boolean | null;
  page: number;
  size: number;
}

const DEFAULT_CRITERIA: OrganizationsListCriteria = {
  search: null,
  active: null,
  page: 1,
  size: 50,
};

/**
 * Reemplaza OrganizationStore (F8/F21). No es `providedIn: 'root'`: sigue
 * siendo estado de una sola pantalla (se provee en OrganizationListPage).
 *
 * No tiene signals propios de filtro: `connect()` recibe una función que lee
 * los `input()` del componente directo. El `httpResource` la invoca dentro de
 * su cómputo reactivo, así que rastrea esos signals sin necesidad de
 * `effect()` — evita el anti-patrón de sincronizar un signal con otro
 * (y el loop infinito real que causó en la primera versión de este facade).
 */
@Injectable()
export class OrganizationsListFacade {
  #criteria: () => OrganizationsListCriteria = () => DEFAULT_CRITERIA;

  connect(criteria: () => OrganizationsListCriteria): void {
    this.#criteria = criteria;
  }

  readonly #listResource = httpResource<ApiPagedResponse<Organization>>(() => {
    const c = this.#criteria();
    return {
      url: `${environment.apiUrl}/v1/organizations`,
      params: buildHttpParams({ page: c.page, size: c.size, search: c.search, active: c.active }),
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
    if (c.active !== null) return 'filtered';
    return 'no-records';
  });

  reload(): void {
    this.#listResource.reload();
  }
}
