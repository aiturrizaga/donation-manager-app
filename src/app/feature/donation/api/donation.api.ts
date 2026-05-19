import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ApiPagedResponse, PageContent, PageQuery } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';

@Injectable({
  providedIn: 'root',
})
export class DonationApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/donations`;

  getAll(query: PageQuery, filters: {donorId: string, status?: string}): Observable<PageContent<any>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http.get<ApiPagedResponse<any>>(this.#base, { params }).pipe(map((r) => r.data));
  }
}
