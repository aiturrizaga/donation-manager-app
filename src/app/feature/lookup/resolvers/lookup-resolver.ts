import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { LookupApi } from '@shared/api/lookup.api';
import { Lookup } from '@domain/lookup';

export const lookupResolver: ResolveFn<Lookup> = (route) => {
  const api = inject(LookupApi);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/settings/lookups']).then();
      return EMPTY;
    }),
  );
};
