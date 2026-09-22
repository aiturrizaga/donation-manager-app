import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-maintenance-page',
  template: `
    <div class="flex flex-col items-center justify-center gap-3 min-h-screen text-center px-4">
      <i class="ti ti-tool text-4xl text-gray-400" aria-hidden="true"></i>
      <h1 class="text-lg font-semibold text-gray-700 dark:text-zinc-200">Servicio no disponible</h1>
      <p class="text-sm text-gray-500 dark:text-zinc-400 max-w-sm">
        Estamos realizando tareas de mantenimiento. Por favor, intenta nuevamente en unos minutos.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenancePage {}
