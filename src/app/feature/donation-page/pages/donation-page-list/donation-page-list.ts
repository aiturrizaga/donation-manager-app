import { Component, inject, OnInit, signal } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DonationPageStore } from '../../store/donation-page.store';
import { DonationPageFilters } from '../../components/donation-page-filters/donation-page-filters';
import { DonationPageDataView } from '../../components/donation-page-data-view/donation-page-data-view';
import { DonationPageFilterParams, DonationPageSummary } from '../../models/donation-page.model';
import { OrganizationApi } from '../../../organization/api/organization.api';
import { Organization } from '../../../organization/models/organization.model';
import { CreateDonationPageDlg } from '../../components/create-donation-page-dlg/create-donation-page-dlg';

const STATUS_TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
] as const;

type PageTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-donation-page-list',
  imports: [
    DonationPageFilters,
    DonationPageDataView,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [DonationPageStore, ConfirmationService, DialogService],
  templateUrl: './donation-page-list.html',
})
export class DonationPageListPage implements OnInit {
  readonly store = inject(DonationPageStore);
  readonly #confirm = inject(ConfirmationService);
  readonly #dialog = inject(DialogService);
  readonly #orgApi = inject(OrganizationApi);

  readonly statusTabs = STATUS_TABS;
  activeStatus: PageTabValue = 'all';
  readonly organizations = signal<Organization[]>([]);

  ngOnInit(): void {
    this.store.load();
    this._loadOrganizations();
  }

  private _loadOrganizations(): void {
    this.#orgApi
      .getAll({ page: 1, size: 100 }, {})
      .subscribe((data) =>
        this.organizations.set(
          data.items.map((o) => ({ ...o, tradeName: o.tradeName ?? o.legalName })),
        ),
      );
  }

  onStatusChange(tab: string | number | undefined): void {
    this.activeStatus = (tab as PageTabValue) ?? 'all';
    const isActive = tab === 'active' ? true : tab === 'inactive' ? false : null;
    this.store.setFilters({ ...this.store.filters(), isActive });
    this.store.load();
  }

  onFiltersChange(filters: DonationPageFilterParams): void {
    const isActive =
      this.activeStatus === 'active' ? true : this.activeStatus === 'inactive' ? false : null;
    this.store.setFilters({ ...filters, isActive });
    this.store.load();
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.store.changePage(page, event.rows);
    this.store.load();
  }

  onToggleActive(page: DonationPageSummary): void {
    const deactivating = page.isActive;
    this.#confirm.confirm({
      message: `¿Deseas ${deactivating ? 'desactivar' : 'activar'} "${page.name}"?`,
      header: deactivating ? 'Desactivar página' : 'Activar página',
      icon: deactivating ? 'ti ti-eye-off' : 'ti ti-eye',
      rejectLabel: 'No',
      acceptLabel: deactivating ? 'Sí, desactivar' : 'Sí, activar',
      acceptButtonProps: deactivating ? { severity: 'danger' } : {},
      accept: () => this.store.toggleActive(page),
      reject: () => this.store.revertItem(page),
    });
  }

  onDelete(page: DonationPageSummary): void {
    this.#confirm.confirm({
      message: `¿Eliminar "${page.name}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar página',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.store.remove(page.id),
    });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(CreateDonationPageDlg, {
      header: 'Nueva página de donación',
      width: '540px',
      modal: true,
      closable: true,
      data: { organizations: this.organizations() },
    });

    ref?.onClose.subscribe((result) => {
      if (result) this.store.load();
    });
  }
}
