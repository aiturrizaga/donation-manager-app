import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { DonationApi } from '../api/donation.api';
import { Donation } from '../models/donation.model';

export const donationResolver: ResolveFn<Donation> = (route) => {
  const api = inject(DonationApi);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  return api.getById(id).pipe(
    tap((_) => {
      route.data = {
        ...route.data,
        title: 'Detalle de donación',
        breadcrumb: 'Detalles',
      };
    }),
    catchError(() => {
      router.navigate(['/donations']).then();
      return EMPTY;
    }),
  );
};
