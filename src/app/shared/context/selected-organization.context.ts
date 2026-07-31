import { Injectable, computed, inject, signal } from '@angular/core';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';

/**
 * Organización seleccionada globalmente — persiste al navegar entre features
 * (no vive en queryParams porque el control que la cambia se renderiza en
 * cada página por separado, no en un solo componente de shell).
 *
 * Selección única e intencional: esta se usa solo en páginas donde el id
 * elegido determina la organización cuyos recursos anidados se administran
 * (Donation Targets, Payment Gateways — construyen rutas tipo
 * `/organizations/{orgId}/targets` y necesitan exactamente una). Para
 * filtrar listados por una o más organizaciones (donaciones, páginas de
 * donación, suscripciones), ver SelectedOrganizationsFilterContext.
 */
@Injectable({ providedIn: 'root' })
export class SelectedOrganizationContext {
  private readonly catalog = inject(OrganizationsCatalog);

  readonly selectedId = signal<number | null>(null);

  readonly selected = computed(
    () => this.catalog.items().find((o) => o.id === this.selectedId()) ?? null,
  );

  select(id: number | null): void {
    this.selectedId.set(id);
  }
}
