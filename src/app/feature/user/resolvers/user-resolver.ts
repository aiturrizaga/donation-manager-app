import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { UserApi } from '../api/user.api';
import { User } from '@domain/user';

export const userResolver: ResolveFn<User> = (route) => {
  const api = inject(UserApi);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return api.getById(id).pipe(
    catchError(() => {
      router.navigate(['/users']).then();
      return EMPTY;
    }),
  );
};
