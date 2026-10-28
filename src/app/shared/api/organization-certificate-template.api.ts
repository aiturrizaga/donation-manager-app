import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models';
import {
  CertificateTemplate,
  CertificateTemplateUpsertRequest,
  CertificateVariable,
} from '@domain/certificate-template';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class CertificateTemplateApi {
  readonly #http = inject(HttpClient);

  #base(orgId: number): string {
    return `${environment.apiUrl}/v1/organizations/${orgId}/certificate-template`;
  }

  get(orgId: number): Observable<CertificateTemplate | null> {
    return this.#http
      .get<ApiResponse<CertificateTemplate | null>>(this.#base(orgId))
      .pipe(map((r) => r.data));
  }

  upsert(orgId: number, payload: CertificateTemplateUpsertRequest): Observable<CertificateTemplate> {
    return this.#http
      .put<ApiResponse<CertificateTemplate>>(this.#base(orgId), payload)
      .pipe(map((r) => r.data));
  }

  delete(orgId: number): Observable<void> {
    return this.#http
      .delete<ApiResponse<null>>(this.#base(orgId))
      .pipe(map(() => undefined));
  }

  getVariables(orgId: number): Observable<CertificateVariable[]> {
    return this.#http
      .get<ApiResponse<CertificateVariable[]>>(`${this.#base(orgId)}/variables`)
      .pipe(map((r) => r.data));
  }

  // The preview endpoint requires the same Bearer auth as everything else —
  // a plain window.open(url) wouldn't carry it (it's a raw navigation, not
  // an HttpClient request the auth interceptor can attach to), so this
  // fetches the PDF as a blob and the caller turns that into an object URL.
  previewPdf(orgId: number): Observable<Blob> {
    return this.#http.get(`${this.#base(orgId)}/preview`, { responseType: 'blob' });
  }
}
