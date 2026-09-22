import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

/**
 * Se llega aquí cuando Keycloak autentica correctamente pero el usuario no
 * tiene un registro local (users/user_providers) o su cuenta está inactiva —
 * GET /users/me/permissions responde 401/403 por ese motivo. Vive FUERA del
 * shell guardado por authGuard a propósito: si estuviera dentro, redirigir
 * aquí volvería a disparar el mismo guard y el mismo fallo, en bucle infinito
 * (el bug real que causaba esta pantalla nunca apareciera y en su lugar la
 * pestaña quedara girando peticiones a /users/me/permissions sin parar).
 */
@Component({
  selector: 'app-access-denied-page',
  template: `
    <div class="flex flex-col items-center justify-center gap-3 min-h-screen text-center px-4">
      <i class="ti ti-lock-off text-4xl text-gray-400" aria-hidden="true"></i>
      <h1 class="text-lg font-semibold text-gray-700 dark:text-zinc-200">Sin acceso a esta aplicación</h1>
      <p class="text-sm text-gray-500 dark:text-zinc-400 max-w-sm">
        Tu sesión es válida, pero tu usuario todavía no tiene una cuenta configurada aquí (o está
        desactivada). Pide a un administrador que te dé de alta con un rol, o intenta con otra
        cuenta.
      </p>
      <button
        type="button"
        class="mt-2 text-sm font-medium text-blue-600 hover:underline"
        (click)="logout()"
      >
        Cerrar sesión e intentar con otra cuenta
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedPage {
  readonly #keycloak = inject(Keycloak);

  logout(): void {
    this.#keycloak.logout({ redirectUri: window.location.origin }).catch(() => {});
  }
}
