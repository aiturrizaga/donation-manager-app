import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { DonationPageApi } from '../api/donation-page.api';
import { DonationPage } from '../models/donation-page.model';

export const donationPageResolver: ResolveFn<DonationPage> = (route) => {
  const api = inject(DonationPageApi);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  return api.getById(id).pipe(
    tap((page) => {
      route.data = {
        ...route.data,
        title: page.name,
        breadcrumb: page.name,
      }
    }),
    catchError(() => {
      router.navigate(['/pages']).then();
      return EMPTY;
    }),
  );
};
