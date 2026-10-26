import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { EmailSettingsFacade } from '../../facade/email-settings.facade';
import { EmailSettingsForm } from '../../components/email-settings-form/email-settings-form';
import { OrganizationEmailSettings } from '@domain/email-settings';
import { SelectedOrganizationContext } from '@shared/context/selected-organization.context';
import { OrganizationSelector } from '@shared/ui/organization-selector/organization-selector';
import { InlineError } from '@shared/ui/inline-error/inline-error';

@Component({
  selector: 'app-email-settings-page',
  imports: [OrganizationSelector, EmailSettingsForm, InlineError],
  providers: [EmailSettingsFacade],
  templateUrl: './email-settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailSettingsPage {
  protected readonly facade = inject(EmailSettingsFacade);
  protected readonly orgContext = inject(SelectedOrganizationContext);

  // Sobre-escritura local tras guardar/eliminar — mismo patrón que
  // OrganizationDetail.currentOrganization, evita esperar el round-trip del
  // reload() del httpResource solo para reflejar lo que ya se sabe.
  readonly #override = signal<OrganizationEmailSettings | null | undefined>(undefined);

  protected readonly resolvedSettings = () => {
    const override = this.#override();
    return override !== undefined ? override : this.facade.settings();
  };

  constructor() {
    this.facade.connect(() => this.orgContext.selectedId());
    // Descarta la sobre-escritura local al cambiar de organización — el
    // formulario debe reflejar lo que devuelva el httpResource para la
    // organización recién seleccionada, no lo último guardado en la anterior.
    effect(() => {
      this.orgContext.selectedId();
      this.#override.set(undefined);
    });
  }

  onSaved(updated: OrganizationEmailSettings): void {
    this.#override.set(updated);
  }

  onDeleted(): void {
    this.#override.set(null);
  }
}
