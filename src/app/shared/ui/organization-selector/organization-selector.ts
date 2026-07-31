import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';
import { SelectedOrganizationContext } from '@shared/context/selected-organization.context';

/**
 * Selector de organización reutilizable — cada página lo monta en su propia
 * barra de filtros, pero todas leen/escriben el mismo estado global
 * (`SelectedOrganizationContext`), así que la selección persiste al navegar
 * sin necesidad de un único control fijo en el navbar.
 */
@Component({
  selector: 'app-organization-selector',
  imports: [FormsModule, Select],
  templateUrl: './organization-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationSelector {
  protected readonly catalog = inject(OrganizationsCatalog);
  protected readonly context = inject(SelectedOrganizationContext);
}
