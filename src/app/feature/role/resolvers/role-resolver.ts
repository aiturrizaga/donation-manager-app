import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { RbacApi } from '@shared/api/rbac.api';
import { Role } from '@domain/rbac';

export const roleResolver: ResolveFn<Role> = (route) => {
  const api = inject(RbacApi);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return api.getRole(id).pipe(
    catchError(() => {
      router.navigate(['/roles']).then();
      return EMPTY;
    }),
  );
};
