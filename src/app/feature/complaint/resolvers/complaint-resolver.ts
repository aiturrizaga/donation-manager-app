import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { ComplaintApi } from '@shared/api/complaint.api';
import { Complaint } from '@domain/complaint';

export const complaintResolver: ResolveFn<Complaint> = (route) => {
  const api = inject(ComplaintApi);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/complaints']).then();
      return EMPTY;
    }),
  );
};
