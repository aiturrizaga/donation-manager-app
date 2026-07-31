import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { DonationPageApi } from '../api/donation-page.api';
import { DonationPage } from '@domain/donation-page';

export const donationPageResolver: ResolveFn<DonationPage> = (route) => {
  const api = inject(DonationPageApi);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/pages']).then();
      return EMPTY;
    }),
  );
};
