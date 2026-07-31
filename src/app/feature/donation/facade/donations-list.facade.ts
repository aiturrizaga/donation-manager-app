import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiPagedResponse } from '@shared/models/api-response.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { Donation } from '@domain/donation';
import { DonationApi } from '@shared/api/donation.api';
import { environment } from '@env/environment';

interface DonationsListCriteria {
  organizationIds: number[];
  status: string | null;
  donationType: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  page: number;
  size: number;
}

const DEFAULT_CRITERIA: DonationsListCriteria = {
  organizationIds: [],
  status: null,
  donationType: null,
  dateFrom: null,
  dateTo: null,
  page: 1,
  size: 50,
};

/** Reemplaza DonationStore. Ver OrganizationsListFacade para el patrón `connect()`. */
@Injectable()
export class DonationsListFacade {
  readonly #api = inject(DonationApi);

  #criteria: () => DonationsListCriteria = () => DEFAULT_CRITERIA;

  connect(criteria: () => DonationsListCriteria): void {
    this.#criteria = criteria;
  }

  readonly #listResource = httpResource<ApiPagedResponse<Donation>>(() => {
    const c = this.#criteria();
    return {
      url: `${environment.apiUrl}/v1/donations`,
      params: buildHttpParams({
        page: c.page,
        size: c.size,
        organizationIds: c.organizationIds,
        status: c.status,
        donationType: c.donationType,
        dateFrom: c.dateFrom,
        dateTo: c.dateTo,
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

  readonly emptyReason = computed((): 'no-records' | 'filtered' | null => {
    if (this.loading() || this.items().length > 0) return null;
    const c = this.#criteria();
    if (c.status || c.donationType || c.dateFrom || c.dateTo) return 'filtered';
    return 'no-records';
  });

  reload(): void {
    this.#listResource.reload();
  }

  exportCsv(): Observable<Blob> {
    const c = this.#criteria();
    return this.#api.exportCsv({
      organizationIds: c.organizationIds,
      status: c.status,
      donationType: c.donationType,
      dateFrom: c.dateFrom,
      dateTo: c.dateTo,
    });
  }
}
