import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { CurrentUserService } from '@core/services/current-user.service';

/**
 * Directiva estructural — muestra el elemento solo si el usuario actual
 * tiene el permiso efectivo dado (permisos de su rol + otorgamientos extra
 * propios). super_admin siempre pasa (bypass), sin necesidad de listar el
 * código explícitamente.
 *
 * Uso: `<button *appHasPermission="'donation:create'">...</button>` o
 * `<button *appHasPermission="['donation:create', 'donation:update']">...</button>`
 * (OR — basta con tener uno de los códigos listados).
 */
@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  readonly appHasPermission = input.required<string | string[]>();

  readonly #templateRef = inject(TemplateRef<unknown>);
  readonly #viewContainer = inject(ViewContainerRef);
  readonly #currentUser = inject(CurrentUserService);

  #hasView = false;

  constructor() {
    effect(() => {
      const allowed = this.#currentUser.hasPermission(this.appHasPermission());

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
