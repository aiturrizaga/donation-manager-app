import { Component, inject, OnInit, signal } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DonationTargetStore } from '../../store/donation-target.store';
import { DonationTargetFilters } from '../../components/donation-target-filters/donation-target-filters';
import { DonationTargetDataView } from '../../components/donation-target-data-view/donation-target-data-view';
import { SaveDonationTargetDlg } from '../../components/save-donation-target-dlg/save-donation-target-dlg';
import { DonationTarget, DonationTargetFilterParams } from '../../models/donation-target.model';
import { OrganizationApi } from '../../../organization/api/organization.api';
import { Organization } from '../../../organization/models/organization.model';

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'finished', label: 'Finalizados' },
] as const;

type TargetTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-donation-target-list-page',
  imports: [
    DonationTargetFilters,
    DonationTargetDataView,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [DonationTargetStore, ConfirmationService, DialogService],
  templateUrl: './donation-target-list.html',
})
export class DonationTargetListPage implements OnInit {
  readonly store = inject(DonationTargetStore);
  readonly #confirm = inject(ConfirmationService);
  readonly #dialog = inject(DialogService);
  readonly #orgApi = inject(OrganizationApi);

  readonly statusTabs = STATUS_TABS;
  activeStatus: TargetTabValue = 'all';
  readonly organizations = signal<Organization[]>([]);

  ngOnInit(): void {
    this._loadOrganizations();
  }

  private _loadOrganizations(): void {
    this.#orgApi.getAll({ page: 1, size: 100 }, {}).subscribe((data) => {
      const orgs = data.items.map((o) => ({
        ...o,
        tradeName: o.tradeName ?? o.legalName,
      }));
      this.organizations.set(orgs);
    });
  }

  onStatusChange(tab: string | number | undefined): void {
    this.activeStatus = (tab as TargetTabValue) ?? 'all';
    const status = tab === 'all' ? null : (tab as string);
    this.store.setFilters({ ...this.store.filters(), status });
    this.store.load();
  }

  onFiltersChange(
    filters: { organizationId: number | null } & Omit<DonationTargetFilterParams, 'status'>,
  ): void {
    const status = this.activeStatus === 'all' ? null : this.activeStatus;
    this.store.setOrganization(filters.organizationId);
    this.store.setFilters({ search: filters.search, targetType: filters.targetType, status });
    if (filters.organizationId) this.store.load();
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.store.changePage(page, event.rows);
    this.store.load();
  }

  onSetStatus(event: { target: DonationTarget; status: 'active' | 'paused' | 'finished' }): void {
    const labels: Record<string, string> = {
      active: 'activar',
      paused: 'pausar',
      finished: 'finalizar',
    };
    this.#confirm.confirm({
      message: `¿Deseas ${labels[event.status]} "${event.target.name}"?`,
      header: 'Cambiar estado',
      icon: 'ti ti-refresh',
      rejectLabel: 'No',
      acceptLabel: `Sí, ${labels[event.status]}`,
      accept: () => this.store.setStatus(event.target, event.status),
    });
  }

  onDelete(target: DonationTarget): void {
    this.#confirm.confirm({
      message: `¿Eliminar "${target.name}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar objetivo',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.store.remove(target.id),
    });
  }

  openDialog(target?: DonationTarget): void {
    const ref = this.#dialog.open(SaveDonationTargetDlg, {
      header: target ? 'Editar objetivo' : 'Nuevo objetivo',
      width: '560px',
      modal: true,
      closable: true,
      data: { organizations: this.organizations(), target },
    });

    ref?.onClose.subscribe((result: DonationTarget) => {
      if (result) this.store.load();
    });
  }
}
