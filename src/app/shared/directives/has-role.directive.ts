import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { CurrentUserService } from '@core/services/current-user.service';

/**
 * Directiva estructural — muestra el elemento solo si el rol del usuario
 * actual coincide exactamente con alguno de los dados.
 *
 * Uso: `<button *appHasRole="'admin'">...</button>` o
 * `<button *appHasRole="['admin', 'analista']">...</button>`.
 * Para chequear un permiso efectivo (rol + otorgamientos extra) en vez de un
 * rol exacto, usar *appHasPermission.
 */
@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  readonly appHasRole = input.required<string | string[]>();

  readonly #templateRef = inject(TemplateRef<unknown>);
  readonly #viewContainer = inject(ViewContainerRef);
  readonly #currentUser = inject(CurrentUserService);

  #hasView = false;

  constructor() {
    effect(() => {
      const allowed = this.#currentUser.hasRole(this.appHasRole());

      if (allowed && !this.#hasView) {
        this.#viewContainer.createEmbeddedView(this.#templateRef);
        this.#hasView = true;
      } else if (!allowed && this.#hasView) {
        this.#viewContainer.clear();
        this.#hasView = false;
      }
    });
  }
}
