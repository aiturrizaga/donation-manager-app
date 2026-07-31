import { HttpContext, HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { AppError } from '@shared/models';
import { ConnectivityService, GlobalLoadingService, GlobalProcess } from '@core/services';

export const GLOBAL_LOADING = new HttpContextToken<GlobalProcess | null>(() => null);

export function withGlobalLoading(process: GlobalProcess): HttpContext {
  return new HttpContext().set(GLOBAL_LOADING, process);
}

export const errorNormalizingInterceptor: HttpInterceptorFn = (req, next) => {
  const globalLoading = inject(GlobalLoadingService);
  const connectivity = inject(ConnectivityService);
  const router = inject(Router);

  const process = req.context.get(GLOBAL_LOADING);
  if (process) globalLoading.begin(process);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const appError = toAppError(err);

      if (appError.status === 0) connectivity.markOffline();
      if (appError.status === 503) router.navigate(['/mantenimiento']);

      return throwError(() => appError);
    }),
    finalize(() => {
      if (process) globalLoading.end(process);
    }),
  );
};

function toAppError(err: HttpErrorResponse): AppError {
  if (err.status === 0) {
    return {
      status: 0,
      code: 'OFFLINE',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.',
      retryable: true,
      cause: err,
    };
  }

  const body = err.error as { code?: string; message?: string; errors?: Record<string, string[]> } | null;
  return {
    status: err.status,
    code: body?.code ?? 'UNKNOWN',
    message: body?.message ?? 'Ocurrió un error inesperado. Intenta nuevamente.',
    fieldErrors: body?.errors,
    retryable: err.status >= 500,
    cause: err,
  };
}
