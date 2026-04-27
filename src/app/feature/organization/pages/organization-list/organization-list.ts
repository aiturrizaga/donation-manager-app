import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { OrganizationStore } from '../../store/organization.store';
import { OrganizationFilters } from '../../components/organization-filters/organization-filters';
import { OrganizationTable } from '../../components/organization-table/organization-table';
import {
  Organization,
  OrganizationFilters as OrgFiltersModel,
} from '../../models/organization.model';

@Component({
  selector: 'app-organization-list',
  imports: [OrganizationFilters, OrganizationTable, ButtonModule, RouterLink, ConfirmDialogModule],
  providers: [OrganizationStore, ConfirmationService],
  templateUrl: './organization-list.html',
  styles: [
    `
      @reference 'tailwindcss';

      .org-page {
        @apply flex flex-col gap-4;

        &__header {
          @apply flex items-center justify-between gap-4;
        }

        &__header-info {
          @apply flex flex-col gap-0.5;
        }

        &__title {
          @apply text-lg font-semibold text-gray-900;
        }

        &__subtitle {
          @apply text-sm text-gray-400;
        }
      }
    `,
  ],
})
export class OrganizationListPage implements OnInit {
  readonly store = inject(OrganizationStore);
  readonly #confirm = inject(ConfirmationService);

  ngOnInit(): void {
    this.store.load();
  }

  onFiltersChange(filters: OrgFiltersModel): void {
    this.store.setFilters(filters);
    this.store.load();
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.store.changePage(page, event.rows);
    this.store.load();
  }

  onToggleActive(org: Organization): void {
    this.#confirm.confirm({
      message: `¿${org.isActive ? 'Desactivar' : 'Activar'} "${org.legalName}"?`,
      header: 'Confirmar acción',
      icon: org.isActive ? 'ti ti-toggle-left' : 'ti ti-toggle-right',
      accept: () => this.store.toggleActive(org),
    });
  }

  onDelete(org: Organization): void {
    this.#confirm.confirm({
      message: `¿Eliminar "${org.legalName}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar organización',
      icon: 'ti ti-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.remove(org.id),
    });
  }
}
