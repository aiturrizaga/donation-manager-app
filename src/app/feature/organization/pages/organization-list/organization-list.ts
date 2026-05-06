import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { ConfirmationService } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { OrganizationStore } from '../../store/organization.store';
import { OrganizationFilters } from '../../components/organization-filters/organization-filters';
import { OrganizationDataView } from '../../components/organization-data-view/organization-data-view';
import { Organization, OrganizationFilterParams } from '../../models/organization.model';

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
] as const;

type OrgTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-organization-list-page',
  imports: [
    OrganizationFilters,
    OrganizationDataView,
    RouterLink,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [OrganizationStore, ConfirmationService],
  templateUrl: './organization-list.html',
})
export class OrganizationListPage implements OnInit {
  readonly store = inject(OrganizationStore);
  readonly #confirm = inject(ConfirmationService);

  readonly statusTabs = STATUS_TABS;
  activeStatus: OrgTabValue = 'all';

  ngOnInit(): void {
    this.store.load();
  }

  onStatusChange(tab: string | number | undefined): void {
    this.activeStatus = (tab as OrgTabValue) ?? 'all';
    const isActive = tab === 'active' ? true : tab === 'inactive' ? false : undefined;
    this.store.setFilters({ active: isActive ?? null });
    this.store.load();
  }

  onFiltersChange(filters: Omit<OrganizationFilterParams, 'active'>): void {
    const isActive =
      this.activeStatus === 'active' ? true : this.activeStatus === 'inactive' ? false : null;
    this.store.setFilters({ ...filters, active: isActive });
    this.store.load();
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.store.changePage(page, event.rows);
    this.store.load();
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
