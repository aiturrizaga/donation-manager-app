import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DonorStore } from '../../store/donor.store';
import { DonorFilters } from '../../components/donor-filters/donor-filters';
import { DonorDataView } from '../../components/donor-data-view/donor-data-view';
import { DonorPreviewDrawer } from '../../components/donor-preview-drawer/donor-preview-drawer';
import { SaveDonorDlg } from '../../components/save-donor-dlg/save-donor-dlg';
import { Donor, DonorFilterParams } from '../../models/donor.model';
import { OrganizationApi } from '../../../organization/api/organization.api';
import { Organization } from '../../../organization/models/organization.model';

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
] as const;

type DonorTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-donor-list-page',
  imports: [
    DonorFilters,
    DonorDataView,
    DonorPreviewDrawer,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [DonorStore, ConfirmationService, DialogService],
  templateUrl: './donor-list.html',
})
export class DonorListPage implements OnInit {
  readonly store = inject(DonorStore);
  readonly #confirm = inject(ConfirmationService);
  readonly #dialog = inject(DialogService);
  readonly #orgApi = inject(OrganizationApi);

  readonly statusTabs = STATUS_TABS;
  activeStatus: DonorTabValue = 'all';

  readonly organizations = signal<Organization[]>([]);
  readonly previewVisible = signal(false);
  readonly previewDonor = signal<Donor | null>(null);

  ngOnInit(): void {
    this.store.load();
    this._loadOrganizations();
  }

  private _loadOrganizations(): void {
    this.#orgApi
      .getAll({ page: 1, size: 100 }, {})
      .subscribe((data) => this.organizations.set(data.items));
  }

  onStatusChange(tab: string | number | undefined): void {
    this.activeStatus = (tab as DonorTabValue) ?? 'all';
    const isActive = tab === 'active' ? true : tab === 'inactive' ? false : null;
    this.store.setFilters({ isActive });
    this.store.load();
  }

  onFiltersChange(filters: Omit<DonorFilterParams, 'isActive'>): void {
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

  onToggleActive(donor: Donor): void {
    const deactivating = donor.isActive;
    this.#confirm.confirm({
      message: `¿Deseas ${deactivating ? 'desactivar' : 'activar'} a ${donor.partner.name}?`,
      header: deactivating ? 'Desactivar donante' : 'Activar donante',
      icon: deactivating ? 'ti ti-user-off' : 'ti ti-user-check',
      rejectLabel: 'No',
      acceptLabel: deactivating ? 'Sí, desactivar' : 'Sí, activar',
      acceptButtonProps: deactivating ? { severity: 'danger' } : {},
      accept: () => this.store.toggleActive(donor),
      reject: () => this.store.revertItem(donor),
    });
  }

  onPreview(donor: Donor): void {
    this.previewDonor.set(donor);
    this.previewVisible.set(true);
  }

  onDelete(donor: Donor): void {
    this.#confirm.confirm({
      message: `¿Eliminar a ${donor.partner.name}? Esta acción no se puede deshacer.`,
      header: 'Eliminar donante',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.store.remove(donor.id),
    });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveDonorDlg, {
      header: 'Nuevo donante',
      width: '560px',
      modal: true,
      closable: true,
    });
    ref?.onClose.subscribe((result: Donor) => {
      if (result) this.store.load();
    });
  }
}
