import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/models/api-response.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DonationCertificateApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/donations`;

  getByDonation(donationId: string): Observable<any> {
    return this.#http
      .get<ApiResponse<any>>(`${this.#base}/${donationId}/certificate`)
      .pipe(map((r) => r.data));
  }

  generate(donationId: string, payload: { forceRegenerate: boolean }): Observable<any> {
    return this.#http
      .post<ApiResponse<any>>(`${this.#base}/${donationId}/certificate`, payload)
      .pipe(map((r) => r.data));
  }

  resendEmail(donationId: string): Observable<void> {
    return this.#http.post<void>(`${this.#base}/${donationId}/certificate/resend-email`, {});
  }

  // fileUrl comes from the certificate response (e.g. DonationCertificateResponse.fileUrl) —
  // already the full download path, keyed by the certificate's UUID rather than its
  // predictable sequential number (which must not be used as a public identifier).
  downloadCertificate(fileUrl: string): Observable<Blob> {
    return this.#http.get(`${environment.apiUrl}${fileUrl}`, {
      responseType: 'blob',
    });
  }
}
