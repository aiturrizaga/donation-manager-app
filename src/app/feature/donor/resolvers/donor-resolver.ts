import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { DonorApi } from '../api/donor.api';
import { Donor } from '@domain/donor';

export const donorResolver: ResolveFn<Donor> = (route) => {
  const api = inject(DonorApi);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/donors']).then();
      return EMPTY;
    }),
  );
};
