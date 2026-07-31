import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OrganizationApi } from '@shared/api/organization.api';
import { Organization } from '@domain/organization';

export const organizationResolver: ResolveFn<Organization> = (route) => {
  const api = inject(OrganizationApi);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/organizations']).then();
      return EMPTY;
    }),
  );
};
