import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, PageContent, PageQuery } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import { RecurringSubscription, SubscriptionFilterParams } from '@domain/recurring-subscription';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class RecurringSubscriptionApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/subscriptions`;

  getAll(
    query: PageQuery,
    filters: SubscriptionFilterParams,
  ): Observable<PageContent<RecurringSubscription>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http
      .get<ApiPagedResponse<RecurringSubscription>>(this.#base, { params })
      .pipe(map((r) => r.data));
  }
}
