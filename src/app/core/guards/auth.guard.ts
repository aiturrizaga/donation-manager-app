import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { catchError, map, of } from 'rxjs';
import { CurrentUserService } from '@core/services/current-user.service';

/**
 * Además de exigir sesión de Keycloak, asegura que los permisos efectivos del
 * usuario (rol, permisos, organizaciones) estén cargados antes de activar
 * cualquier ruta bajo el shell — así las directivas *appHasRole/
 * *appHasPermission y el filtrado del menú siempre tienen datos frescos
 * desde el primer render. `loaded()` evita repetir la llamada en cada
 * navegación dentro de la misma sesión.
 *
 * Si /users/me/permissions falla (401/403 — Keycloak autenticó pero el
 * usuario no tiene cuenta local o está inactivo), NUNCA redirigir a '/' ni a
 * cualquier otra ruta bajo el shell: como esas rutas también llevan
 * authGuard, se volvería a intentar cargar los permisos, volvería a fallar,
 * y quedaría en bucle infinito (confirmado en vivo — así se manifestó este
 * bug: la pestaña quedaba disparando peticiones a /users/me/permissions sin
 * parar). Por eso el destino del catchError es una ruta FUERA del shell.
 */
export const authGuard: CanActivateFn = () => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);
  const currentUser = inject(CurrentUserService);

  if (!keycloak.authenticated) return router.parseUrl('/');
  if (currentUser.loaded()) return true;

  return currentUser.load().pipe(
    map(() => true),
    catchError(() => of(router.parseUrl('/acceso-denegado'))),
  );
};
