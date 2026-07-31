import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';
import { Organization } from '@domain/organization';
import { OrganizationApi } from '@shared/api/organization.api';
import { OrganizationGeneralForm } from '../../components/organization-general-form/organization-general-form';
import { PageTitleService } from '@core/services';
import { environment } from '@env/environment';

@Component({
  selector: 'app-organization-detail',
  imports: [Avatar, Button, Tag, OrganizationGeneralForm],
  templateUrl: './organization-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetail {
  readonly #router = inject(Router);
  readonly #api = inject(OrganizationApi);
  readonly #confirm = inject(ConfirmationService);
  readonly #pageTitle = inject(PageTitleService);

  readonly organization = input.required<Organization>();
  readonly currentOrganization = signal<Organization | null>(null);

  readonly resolvedOrganization = () => this.currentOrganization() ?? this.organization();

  constructor() {
    // Route.title (función) no puede leer route.data de otro resolver (se
    // resuelven en paralelo) — el título de pestaña se setea aquí en su lugar.
    effect(() => this.#pageTitle.setPageTitle(this.resolvedOrganization().legalName));
  }

  logoUrl(): string | null {
    const path = this.resolvedOrganization().logoPath;
    return path ? `${environment.apiUrl}${path}` : null;
  }

  initials(): string {
    return this.resolvedOrganization()
      .legalName.split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  onSaved(updated: Organization): void {
    this.currentOrganization.set(updated);
  }

  toggleActive(): void {
    const org = this.resolvedOrganization();
    const deactivating = org.isActive;
    this.#confirm.confirm({
      message: `¿Deseas ${deactivating ? 'desactivar' : 'activar'} "${org.legalName}"?`,
      header: deactivating ? 'Desactivar organización' : 'Activar organización',
      icon: deactivating ? 'ti ti-building-off' : 'ti ti-building',
      rejectLabel: 'No',
      acceptLabel: deactivating ? 'Sí, desactivar' : 'Sí, activar',
      acceptButtonProps: deactivating ? { severity: 'danger' } : {},
      accept: () => {
        const call$ = deactivating ? this.#api.deactivate(org.id) : this.#api.activate(org.id);
        call$.subscribe((updated) => this.currentOrganization.set(updated));
      },
    });
  }

  goBack(): void {
    this.#router.navigate(['/organizations']).then();
  }
}
