import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models';
import { buildHttpParams } from '@shared/utils/http.util';
import { environment } from '@env/environment';
import { DashboardFilterParams, DashboardSummary } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/dashboard`;

  getSummary(filters: DashboardFilterParams): Observable<DashboardSummary> {
    const params = buildHttpParams({ ...filters });
    return this.#http
      .get<ApiResponse<DashboardSummary>>(`${this.#base}/summary`, { params })
      .pipe(map((r) => r.data));
  }
}
