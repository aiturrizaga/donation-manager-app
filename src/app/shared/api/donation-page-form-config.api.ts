import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent } from '@shared/models/api-response.model';
import { buildHttpParams } from '@shared/utils/http.util';
import { DonationPageSummary, FormConfig } from '@domain/donation-page';
import { environment } from '@env/environment';

/**
 * Porción de `DonationPageApi` compartida entre `donation-pages` (pestaña
 * "Formulario") y `donation-form` (F5). Solo lectura de listado + CRUD de
 * FormConfig — el resto del ciclo de vida de una DonationPage (branding,
 * targets, gateway propio, activar/desactivar) sigue siendo exclusivo de la
 * feature `donation-pages` (Interface Segregation).
 */
@Injectable({ providedIn: 'root' })
export class DonationPageFormConfigApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/donation-pages`;

  getAllSummaries(): Observable<PageContent<DonationPageSummary>> {
    const params = buildHttpParams({ page: 1, size: 100 });
    return this.#http
      .get<ApiPagedResponse<DonationPageSummary>>(this.#base, { params })
      .pipe(map((r) => r.data));
  }

  getFormConfig(pageId: string): Observable<FormConfig> {
    return this.#http
      .get<ApiResponse<FormConfig>>(`${this.#base}/${pageId}/form-config`)
      .pipe(map((r) => r.data));
  }

  createFormConfig(pageId: string, payload: any): Observable<FormConfig> {
    return this.#http
      .post<ApiResponse<FormConfig>>(`${this.#base}/${pageId}/form-config`, payload)
      .pipe(map((r) => r.data));
  }

  updateFormConfig(pageId: string, payload: any): Observable<FormConfig> {
    return this.#http
      .patch<ApiResponse<FormConfig>>(`${this.#base}/${pageId}/form-config`, payload)
      .pipe(map((r) => r.data));
  }
}
