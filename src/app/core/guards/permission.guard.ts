import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserService } from '@core/services/current-user.service';

/**
 * Factory de guard: restringe una ruta a quienes tengan el permiso indicado.
 * super_admin siempre pasa (bypass ya resuelto en CurrentUserService.hasPermission).
 */
export function permissionGuard(permission: string | string[]): CanActivateFn {
  return () => {
    const currentUser = inject(CurrentUserService);
    const router = inject(Router);

    return currentUser.hasPermission(permission) ? true : router.parseUrl('/');
  };
}
