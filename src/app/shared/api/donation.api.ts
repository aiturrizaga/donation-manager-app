import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent, PageQuery } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import { Donation, DonationFilterParams, WebhookEvent } from '@domain/donation';
import { environment } from '@env/environment';

/** Promovido a shared/api: lo consumen `donations` y `donors` (donor-profile) — F5. */
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

  getById(id: string): Observable<Donation> {
    return this.#http.get<ApiResponse<Donation>>(`${this.#base}/${id}`).pipe(map((r) => r.data));
  }

  refund(id: string, payload: { refundReason: string }): Observable<Donation> {
    return this.#http
      .post<ApiResponse<Donation>>(`${this.#base}/${id}/refund`, payload)
      .pipe(map((r) => r.data));
  }

  getWebhookEvents(donationId: string): Observable<WebhookEvent[]> {
    return this.#http
      .get<ApiResponse<WebhookEvent[]>>(`${this.#base}/${donationId}/webhook-events`)
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
