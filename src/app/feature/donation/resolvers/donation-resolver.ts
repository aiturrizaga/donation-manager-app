import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { DonationApi } from '@shared/api/donation.api';
import { Donation } from '@domain/donation';

export const donationResolver: ResolveFn<Donation> = (route) => {
  const api = inject(DonationApi);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/donations']).then();
      return EMPTY;
    }),
  );
};
