import { Injectable, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ApiPagedResponse } from '@shared/models/api-response.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { Complaint } from '@domain/complaint';
import { environment } from '@env/environment';

interface ComplaintsListCriteria {
  organizationIds: number[];
  search: string | null;
  status: string | null;
  recordType: string | null;
  unassigned: boolean;
  page: number;
  size: number;
}

const DEFAULT_CRITERIA: ComplaintsListCriteria = {
  organizationIds: [],
  search: null,
  status: null,
  recordType: null,
  unassigned: false,
  page: 1,
  size: 50,
};

/** Ver OrganizationsListFacade para el patrón `connect()`. */
@Injectable()
export class ComplaintsListFacade {
  #criteria: () => ComplaintsListCriteria = () => DEFAULT_CRITERIA;

  connect(criteria: () => ComplaintsListCriteria): void {
    this.#criteria = criteria;
  }

  readonly #listResource = httpResource<ApiPagedResponse<Complaint>>(() => {
    const c = this.#criteria();
    return {
      url: `${environment.apiUrl}/v1/complaints`,
      params: buildHttpParams({
        page: c.page,
        size: c.size,
        organizationIds: c.organizationIds,
        search: c.search,
        status: c.status,
        recordType: c.recordType,
        unassigned: c.unassigned,
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
    if (c.status || c.recordType) return 'filtered';
    return 'no-records';
  });

  reload(): void {
    this.#listResource.reload();
  }
}
