import { Injectable, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ApiPagedResponse } from '@shared/models/api-response.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { User } from '@domain/user';
import { environment } from '@env/environment';

interface UsersListCriteria {
  search: string | null;
  isActive: boolean | null;
  page: number;
  size: number;
}

const DEFAULT_CRITERIA: UsersListCriteria = {
  search: null,
  isActive: null,
  page: 1,
  size: 50,
};

/** Reemplaza UserStore. Ver OrganizationsListFacade para el patrón `connect()`. */
@Injectable()
export class UsersListFacade {
  #criteria: () => UsersListCriteria = () => DEFAULT_CRITERIA;

  connect(criteria: () => UsersListCriteria): void {
    this.#criteria = criteria;
  }

  readonly #listResource = httpResource<ApiPagedResponse<User>>(() => {
    const c = this.#criteria();
    return {
      url: `${environment.apiUrl}/v1/users`,
      params: buildHttpParams({ page: c.page, size: c.size, search: c.search, isActive: c.isActive }),
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
}
