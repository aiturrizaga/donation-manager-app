import { Injectable, computed, inject, signal } from '@angular/core';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';

/**
 * Organizaciones seleccionadas globalmente para filtrar listados (donaciones,
 * páginas de donación, suscripciones) — persiste al navegar entre features,
 * igual que SelectedOrganizationContext, pero admite varias a la vez porque
 * estos endpoints filtran por una lista (`organizationIds`), no por un solo id.
 *
 * No reemplaza a SelectedOrganizationContext: Donation Targets y Payment
 * Gateways siguen usando esa (selección única), ya que ahí el id elegido
 * determina la organización cuyos recursos anidados se administran
 * (`/organizations/{orgId}/targets`) y no tiene sentido elegir varias.
 */
@Injectable({ providedIn: 'root' })
export class SelectedOrganizationsFilterContext {
  private readonly catalog = inject(OrganizationsCatalog);

  readonly selectedIds = signal<number[]>([]);

  readonly selected = computed(() => {
    const ids = new Set(this.selectedIds());
    return this.catalog.items().filter((o) => ids.has(o.id));
  });

  select(ids: number[] | null): void {
    this.selectedIds.set(ids ?? []);
  }
}
