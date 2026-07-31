import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPagedResponse } from '@shared/models/api-response.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { Donor } from '@domain/donor';
import { DonorApi } from '../api/donor.api';
import { environment } from '@env/environment';

interface DonorsListCriteria {
  organizationIds: number[] | null;
  search: string | null;
  isActive: boolean | null;
  page: number;
  size: number;
}

const DEFAULT_CRITERIA: DonorsListCriteria = {
  organizationIds: null,
  search: null,
  isActive: null,
  page: 1,
  size: 50,
};

/** Reemplaza DonorStore. Ver OrganizationsListFacade para el patrón `connect()`. */
@Injectable()
export class DonorsListFacade {
  readonly #api = inject(DonorApi);

  #criteria: () => DonorsListCriteria = () => DEFAULT_CRITERIA;

  connect(criteria: () => DonorsListCriteria): void {
    this.#criteria = criteria;
  }

  readonly #listResource = httpResource<ApiPagedResponse<Donor>>(() => {
    const c = this.#criteria();
    return {
      url: `${environment.apiUrl}/v1/donors`,
      params: buildHttpParams({
        page: c.page,
        size: c.size,
        search: c.search,
        isActive: c.isActive,
        organizationIds: c.organizationIds,
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
    if (c.isActive !== null) return 'filtered';
    return 'no-records';
  });

  reload(): void {
    this.#listResource.reload();
  }

  toggleActive(donor: Donor): Observable<Donor> {
    return donor.isActive ? this.#api.deactivate(donor.id) : this.#api.activate(donor.id);
  }

  remove(id: string): Observable<void> {
    return this.#api.delete(id);
  }
}
