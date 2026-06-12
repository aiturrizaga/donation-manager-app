import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiPagedResponse, ApiResponse, PageContent } from '@shared/models/api-response.model';
import { PageQuery } from '@shared/models/pagination.model';
import { buildHttpParams } from '@shared/utils/http.util';
import {
  DonationPage,
  DonationPageFilterParams,
  DonationPageSummary,
  FormConfig,
  FormConfigTarget,
  PageBranding,
  PaymentGateway,
} from '../models/donation-page.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DonationPageApi {
  readonly #http = inject(HttpClient);
  readonly #base = `${environment.apiUrl}/v1/donation-pages`;

  getAll(
    query: PageQuery,
    filters: DonationPageFilterParams,
  ): Observable<PageContent<DonationPageSummary>> {
    const params = buildHttpParams({ ...query, ...filters });
    return this.#http
      .get<ApiPagedResponse<DonationPageSummary>>(this.#base, { params })
      .pipe(map((r) => r.data));
  }

  getById(id: string): Observable<DonationPage> {
    return this.#http
      .get<ApiResponse<DonationPage>>(`${this.#base}/${id}`)
      .pipe(map((r) => r.data));
  }

  create(payload: any): Observable<DonationPage> {
    return this.#http.post<ApiResponse<DonationPage>>(this.#base, payload).pipe(map((r) => r.data));
  }

  update(id: string, payload: any): Observable<DonationPage> {
    return this.#http
      .patch<ApiResponse<DonationPage>>(`${this.#base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  activate(id: string): Observable<DonationPage> {
    return this.#http
      .patch<ApiResponse<DonationPage>>(`${this.#base}/${id}/activate`, {})
      .pipe(map((r) => r.data));
  }

  deactivate(id: string): Observable<DonationPage> {
    return this.#http
      .patch<ApiResponse<DonationPage>>(`${this.#base}/${id}/deactivate`, {})
      .pipe(map((r) => r.data));
  }

  delete(id: string): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${id}`);
  }

  setDefault(id: string): Observable<DonationPage> {
    return this.#http
      .patch<ApiResponse<DonationPage>>(`${this.#base}/${id}/set-default`, {})
      .pipe(map((r) => r.data));
  }

  // Branding
  getBranding(pageId: string): Observable<PageBranding> {
    return this.#http
      .get<ApiResponse<PageBranding>>(`${this.#base}/${pageId}/branding`)
      .pipe(map((r) => r.data));
  }

  createBranding(pageId: string, payload: any): Observable<PageBranding> {
    return this.#http
      .post<ApiResponse<PageBranding>>(`${this.#base}/${pageId}/branding`, payload)
      .pipe(map((r) => r.data));
  }

  updateBranding(pageId: string, payload: any): Observable<PageBranding> {
    return this.#http
      .put<ApiResponse<PageBranding>>(`${this.#base}/${pageId}/branding`, payload)
      .pipe(map((r) => r.data));
  }

  // Form config
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

  // Form config targets
  getFormConfigTargets(pageId: string): Observable<FormConfigTarget[]> {
    return this.#http
      .get<ApiResponse<FormConfigTarget[]>>(`${this.#base}/${pageId}/form-config/targets`)
      .pipe(map((r) => r.data));
  }

  assignTarget(pageId: string, payload: any): Observable<FormConfigTarget> {
    return this.#http
      .post<ApiResponse<FormConfigTarget>>(`${this.#base}/${pageId}/form-config/targets`, payload)
      .pipe(map((r) => r.data));
  }

  updateTargetFlags(pageId: string, targetId: number, payload: any): Observable<FormConfigTarget> {
    return this.#http
      .patch<
        ApiResponse<FormConfigTarget>
      >(`${this.#base}/${pageId}/form-config/targets/${targetId}`, payload)
      .pipe(map((r) => r.data));
  }

  unassignTarget(pageId: string, targetId: number): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${pageId}/form-config/targets/${targetId}`);
  }

  // Payment gateway
  getGateway(pageId: string): Observable<PaymentGateway> {
    return this.#http
      .get<ApiResponse<PaymentGateway>>(`${this.#base}/${pageId}/payment-gateway`)
      .pipe(map((r) => r.data));
  }

  createGateway(pageId: string, payload: any): Observable<PaymentGateway> {
    return this.#http
      .post<ApiResponse<PaymentGateway>>(`${this.#base}/${pageId}/payment-gateway`, payload)
      .pipe(map((r) => r.data));
  }

  updateGateway(pageId: string, payload: any): Observable<PaymentGateway> {
    return this.#http
      .patch<ApiResponse<PaymentGateway>>(`${this.#base}/${pageId}/payment-gateway`, payload)
      .pipe(map((r) => r.data));
  }

  activateGateway(pageId: string): Observable<PaymentGateway> {
    return this.#http
      .patch<ApiResponse<PaymentGateway>>(`${this.#base}/${pageId}/payment-gateway/activate`, {})
      .pipe(map((r) => r.data));
  }

  deactivateGateway(pageId: string): Observable<PaymentGateway> {
    return this.#http
      .patch<ApiResponse<PaymentGateway>>(`${this.#base}/${pageId}/payment-gateway/deactivate`, {})
      .pipe(map((r) => r.data));
  }

  testGateway(pageId: string): Observable<any> {
    return this.#http
      .post<ApiResponse<any>>(`${this.#base}/${pageId}/payment-gateway/test`, {})
      .pipe(map((r) => r.data));
  }

  deleteGateway(pageId: string): Observable<void> {
    return this.#http.delete<void>(`${this.#base}/${pageId}/payment-gateway`);
  }
}
