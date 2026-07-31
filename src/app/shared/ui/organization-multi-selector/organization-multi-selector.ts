import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';
import { SelectedOrganizationsFilterContext } from '@shared/context/selected-organizations-filter.context';

/**
 * Selector de organizaciones (multi-select) reutilizable para filtros de
 * listados — cada página lo monta en su propia barra de filtros, pero todas
 * leen/escriben el mismo estado global (`SelectedOrganizationsFilterContext`),
 * así que la selección persiste al navegar. Ver OrganizationSelector para el
 * equivalente de selección única (páginas de recursos anidados por org).
 */
@Component({
  selector: 'app-organization-multi-selector',
  imports: [FormsModule, MultiSelect],
  templateUrl: './organization-multi-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationMultiSelector {
  protected readonly catalog = inject(OrganizationsCatalog);
  protected readonly context = inject(SelectedOrganizationsFilterContext);
}
