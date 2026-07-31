import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Ruta comodín (path: '**') dentro del shell — captura cualquier URL que no
 * matchee ninguna ruta real. Angular NO cambia la URL del navegador al
 * matchear un wildcard: la barra de direcciones sigue mostrando exactamente
 * lo que el usuario escribió/visitó, solo se reemplaza el contenido. Se
 * declara como el último hijo del shell para que se vea con el sidebar/header
 * normales (un usuario autenticado que escribe mal una ruta sigue dentro de
 * la app, no en una pantalla huérfana).
 */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 min-h-[60vh] text-center px-4">
      <i class="ti ti-map-off text-4xl text-gray-400" aria-hidden="true"></i>
      <h1 class="text-lg font-semibold text-gray-700">Página no encontrada</h1>
      <p class="text-sm text-gray-500 max-w-sm">
        La página que buscas no existe o fue movida.
      </p>
      <a routerLink="/dashboard" class="mt-2 text-sm font-medium text-blue-600 hover:underline">
        Volver al inicio
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
