import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, PageContent } from '@shared/models/api-response.model';
import { PageQuery } from '@shared/models/pagination.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { Donation, DonationFilterParams } from '../models/donation.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DonationApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/donations`;

  getAll(query: PageQuery, filters: DonationFilterParams): Observable<PageContent<Donation>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http
      .get<ApiPagedResponse<Donation>>(this.#base, { params })
      .pipe(map((r) => r.data));
  }

  exportCsv(filters: DonationFilterParams): Observable<Blob> {
    const params = buildHttpParams({ ...filters });
    return this.#http.get(`${this.#base}/export`, {
      params,
      responseType: 'blob',
    });
  }
}
