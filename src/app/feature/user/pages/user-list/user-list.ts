import { Component, inject, OnInit } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { UserStore } from '../../store/user.store';
import { UserFilters } from '../../components/user-filters/user-filters';
import { UserDataView } from '../../components/user-data-view/user-data-view';
import { User, UserFilterParams } from '../../models/user.model';
import { SaveUserDlg } from '../../components/save-user-dlg/save-user-dlg';

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
] as const;

type UserTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-user-list-page',
  imports: [
    UserFilters,
    UserDataView,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [UserStore, ConfirmationService, DialogService, MessageService],
  templateUrl: './user-list.html',
})
export class UserListPage implements OnInit {
  readonly store = inject(UserStore);
  readonly #confirm = inject(ConfirmationService);
  readonly #dialog = inject(DialogService);

  readonly statusTabs = STATUS_TABS;
  activeStatus: UserTabValue = 'all';

  ngOnInit(): void {
    this.store.load();
  }

  onStatusChange(tab: string | number | undefined): void {
    this.activeStatus = (tab as UserTabValue) ?? 'all';
    const isActive = tab === 'active' ? true : tab === 'inactive' ? false : null;
    this.store.setFilters({ isActive });
    this.store.load();
  }

  onFiltersChange(filters: Omit<UserFilterParams, 'isActive'>): void {
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

  onToggleActive(user: User): void {
    const action = user.isActive ? 'desactivar' : 'activar';
    this.#confirm.confirm({
      message: `¿Deseas ${action} a ${user.partner.name}?`,
      header: user.isActive ? 'Desactivar usuario' : 'Activar usuario',
      icon: user.isActive ? 'ti ti-user-off' : 'ti ti-user-check',
      acceptButtonStyleClass: user.isActive ? 'p-button-danger' : '',
      accept: () => this.store.toggleActive(user),
    });
  }

  onResetPassword(user: User): void {
    this.#confirm.confirm({
      message: `Se enviará un correo a ${user.partner.email} para restablecer la contraseña.`,
      header: 'Restablecer contraseña',
      icon: 'ti ti-lock-open',
      accept: () => this.store.resetPassword(user.id),
    });
  }

  onDelete(user: User): void {
    this.#confirm.confirm({
      message: `¿Eliminar a ${user.partner.name}? Esta acción no se puede deshacer.`,
      header: 'Eliminar usuario',
      icon: 'ti ti-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.remove(user.id),
    });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveUserDlg, {
      header: 'Nuevo usuario',
      width: '540px',
      modal: true,
      closable: true,
    });

    ref?.onClose.subscribe((result: User) => {
      if (result) this.store.load();
    });
  }
}
