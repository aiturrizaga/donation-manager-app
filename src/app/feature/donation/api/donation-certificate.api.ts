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
}
