import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPagedResponse } from '@shared/models/api-response.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { DonationPage, DonationPageSummary } from '@domain/donation-page';
import { DonationPageApi } from '../api/donation-page.api';
import { environment } from '@env/environment';

interface DonationPagesListCriteria {
  organizationIds: number[];
  search: string | null;
  isActive: boolean | null;
  page: number;
  size: number;
}

const DEFAULT_CRITERIA: DonationPagesListCriteria = {
  organizationIds: [],
  search: null,
  isActive: null,
  page: 1,
  size: 50,
};

/** Reemplaza DonationPageStore. Ver OrganizationsListFacade para el patrón `connect()`. */
@Injectable()
export class DonationPagesListFacade {
  readonly #api = inject(DonationPageApi);

  #criteria: () => DonationPagesListCriteria = () => DEFAULT_CRITERIA;

  connect(criteria: () => DonationPagesListCriteria): void {
    this.#criteria = criteria;
  }

  readonly #listResource = httpResource<ApiPagedResponse<DonationPageSummary>>(() => {
    const c = this.#criteria();
    return {
      url: `${environment.apiUrl}/v1/donation-pages`,
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

  toggleActive(page: DonationPageSummary): Observable<DonationPage> {
    return page.isActive ? this.#api.deactivate(page.id) : this.#api.activate(page.id);
  }

  remove(id: string): Observable<void> {
    return this.#api.delete(id);
  }
}
