import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { RbacApi } from '@shared/api/rbac.api';
import { Role } from '@domain/rbac';
import { SaveRoleDlg } from '../../components/save-role-dlg/save-role-dlg';
import { RoleDataView } from '../../components/role-data-view/role-data-view';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { rowOperation } from '@shared/utils/row-operation';

/**
 * Lista de roles — sin paginación server-side a propósito: el volumen
 * esperado (3 roles sembrados + los personalizados que cree un super_admin)
 * nunca justifica traer una página a la vez.
 */
@Component({
  selector: 'app-role-list-page',
  imports: [RoleDataView, InlineError, ButtonDirective, ButtonIcon, ButtonLabel],
  providers: [DialogService],
  templateUrl: './role-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleListPage {
  readonly #rbacApi = inject(RbacApi);
  readonly #router = inject(Router);
  readonly #dialog = inject(DialogService);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  protected readonly deleteOp = rowOperation<number>();

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(false);
    this.#rbacApi.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  onEdit(role: Role): void {
    this.#router.navigate(['/roles', role.id]).then();
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveRoleDlg, {
      header: 'Nuevo rol',
      width: '520px',
      modal: true,
      closable: true,
    });

    ref?.onClose.subscribe((result: Role) => {
      if (result) this.#router.navigate(['/roles', result.id]).then();
    });
  }

  onDelete(role: Role): void {
    if (this.deleteOp.isActive(role.id)) return;
    this.#confirm.confirm({
      message: `¿Eliminar el rol "${role.displayName}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar rol',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.deleteOp.run(role.id, this.#rbacApi.deleteRole(role.id)).subscribe({
          next: () => this.reload(),
          error: () => this.#notifyError('No se pudo eliminar el rol.'),
        });
      },
    });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }
}
