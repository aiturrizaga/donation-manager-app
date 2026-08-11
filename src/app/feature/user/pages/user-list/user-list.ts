import { ChangeDetectionStrategy, Component, computed, inject, numberAttribute } from '@angular/core';
import { input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { UsersListFacade } from '../../facade/users-list.facade';
import { UserFilters } from '../../components/user-filters/user-filters';
import { UserDataView } from '../../components/user-data-view/user-data-view';
import { User } from '@domain/user';
import { UserApi } from '../../api/user.api';
import { SaveUserDlg } from '../../components/save-user-dlg/save-user-dlg';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { rowOperation } from '@shared/utils/row-operation';

const EMPTY_TEXT: Record<'no-records' | 'filtered' | 'search', { title: string; description: string }> = {
  'no-records': {
    title: 'Aún no hay usuarios',
    description: 'Crea el primer usuario para dar acceso al panel de administración.',
  },
  filtered: {
    title: 'Ningún usuario coincide',
    description: 'Prueba a cambiar el filtro de estado.',
  },
  search: {
    title: 'Sin resultados',
    description: 'Ningún usuario coincide con tu búsqueda.',
  },
};

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
    InlineError,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [UsersListFacade, DialogService],
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListPage {
  readonly search = input<string | null>(null);
  readonly status = input<UserTabValue>('all');
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly facade = inject(UsersListFacade);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);
  readonly #dialog = inject(DialogService);
  readonly #router = inject(Router);
  readonly #api = inject(UserApi);

  readonly statusTabs = STATUS_TABS;

  // El router deja `status()` en `undefined` (no en su valor por defecto)
  // cuando la URL no trae `?status=...` — este signal normaliza ambos casos.
  protected readonly activeStatus = computed<UserTabValue>(() => this.status() ?? 'all');

  protected readonly toggleOp = rowOperation<number>();
  protected readonly resetPasswordOp = rowOperation<number>();
  protected readonly deleteOp = rowOperation<number>();

  protected readonly emptyText = computed(() => {
    const reason = this.facade.emptyReason();
    return reason ? EMPTY_TEXT[reason] : null;
  });

  constructor() {
    this.facade.connect(() => ({
      search: this.search(),
      isActive: this.activeStatus() === 'active' ? true : this.activeStatus() === 'inactive' ? false : null,
      page: this.page(),
      size: 50,
    }));
  }

  onStatusChange(tab: string | number | undefined): void {
    this.#navigate({ status: (tab as UserTabValue) ?? 'all', page: 1 });
  }

  onFiltersChange(filters: { search: string | null }): void {
    this.#navigate({ search: filters.search, page: 1 });
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.#navigate({ page });
  }

  onToggleActive(user: User): void {
    if (this.toggleOp.isActive(user.id)) return;
    const action = user.isActive ? 'desactivar' : 'activar';
    this.#confirm.confirm({
      message: `¿Deseas ${action} a ${user.partner.name}?`,
      header: user.isActive ? 'Desactivar usuario' : 'Activar usuario',
      icon: user.isActive ? 'ti ti-user-off' : 'ti ti-user-check',
      rejectLabel: 'No',
      acceptLabel: `Si, ${action}`,
      acceptButtonStyleClass: user.isActive ? 'p-button-danger' : '',
      accept: () => {
        const call$ = user.isActive ? this.#api.deactivate(user.id) : this.#api.activate(user.id);
        this.toggleOp.run(user.id, call$).subscribe({
          next: () => {
            this.facade.reload();
            this.#notifySuccess(user.isActive ? 'Usuario desactivado.' : 'Usuario activado.');
          },
          error: () => this.#notifyError(`No se pudo ${action} al usuario.`),
        });
      },
    });
  }

  onResetPassword(user: User): void {
    if (this.resetPasswordOp.isActive(user.id)) return;
    this.#confirm.confirm({
      message: `Se enviará un correo a ${user.partner.email} para restablecer la contraseña.`,
      header: 'Restablecer contraseña',
      rejectLabel: 'No',
      acceptLabel: 'Si, enviar',
      icon: 'ti ti-lock-open',
      accept: () => {
        this.resetPasswordOp.run(user.id, this.#api.resetPassword(user.id)).subscribe({
          next: () => this.#notifySuccess('Correo de restablecimiento enviado.'),
          error: () => this.#notifyError('No se pudo enviar el correo de restablecimiento.'),
        });
      },
    });
  }

  onDelete(user: User): void {
    if (this.deleteOp.isActive(user.id)) return;
    this.#confirm.confirm({
      message: `¿Eliminar a ${user.partner.name}? Esta acción no se puede deshacer.`,
      header: 'Eliminar usuario',
      rejectLabel: 'No',
      acceptLabel: 'Si, eliminar',
      icon: 'ti ti-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteOp.run(user.id, this.#api.delete(user.id)).subscribe({
          next: () => this.facade.reload(),
          error: () => this.#notifyError('No se pudo eliminar el usuario.'),
        });
      },
    });
  }

  #notifySuccess(detail: string): void {
    this.#message.add({ severity: 'success', summary: 'Listo', detail });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveUserDlg, {
      header: 'Nuevo usuario',
      width: '540px',
      modal: true,
      closable: true,
    });

    ref?.onClose.subscribe((result: User) => {
      if (result) this.facade.reload();
    });
  }

  #navigate(queryParams: Record<string, unknown>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
