import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { LegalPageApi } from '@shared/api/legal-page.api';
import { LegalPage } from '@domain/legal-page';

export const legalPageResolver: ResolveFn<LegalPage> = (route) => {
  const api = inject(LegalPageApi);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/legal-pages']).then();
      return EMPTY;
    }),
  );
};
