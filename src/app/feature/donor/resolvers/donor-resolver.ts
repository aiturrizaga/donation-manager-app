import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { DonorApi } from '../api/donor.api';
import { Donor } from '../models/donor.model';

export const donorResolver: ResolveFn<Donor> = (route) => {
  const api = inject(DonorApi);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  return api.getById(id).pipe(
    tap((donor) => {
      route.data = {
        ...route.data,
        title: donor.partner.name,
        breadcrumb: donor.partner.name,
      }
    }),
    catchError(() => {
      router.navigate(['/donors']).then();
      return EMPTY;
    }),
  );
};
