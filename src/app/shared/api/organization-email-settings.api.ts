import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models';
import {
  OrganizationEmailSettings,
  OrganizationEmailSettingsTestResult,
  OrganizationEmailSettingsUpsertRequest,
} from '@domain/email-settings';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class EmailSettingsApi {
  readonly #http = inject(HttpClient);

  #base(orgId: number): string {
    return `${environment.apiUrl}/v1/organizations/${orgId}/email-settings`;
  }

  get(orgId: number): Observable<OrganizationEmailSettings | null> {
    return this.#http
      .get<ApiResponse<OrganizationEmailSettings | null>>(this.#base(orgId))
      .pipe(map((r) => r.data));
  }

  upsert(
    orgId: number,
    payload: OrganizationEmailSettingsUpsertRequest,
  ): Observable<OrganizationEmailSettings> {
    return this.#http
      .put<ApiResponse<OrganizationEmailSettings>>(this.#base(orgId), payload)
      .pipe(map((r) => r.data));
  }

  delete(orgId: number): Observable<void> {
    return this.#http
      .delete<ApiResponse<null>>(this.#base(orgId))
      .pipe(map(() => undefined));
  }

  test(orgId: number, recipientEmail?: string | null): Observable<OrganizationEmailSettingsTestResult> {
    return this.#http
      .post<ApiResponse<OrganizationEmailSettingsTestResult>>(`${this.#base(orgId)}/test`, {
        recipientEmail: recipientEmail ?? null,
      })
      .pipe(map((r) => r.data));
  }
}
