import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { MultiSelect } from 'primeng/multiselect';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { RbacApi } from '@shared/api/rbac.api';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';
import { moduleLabel, Permission } from '@domain/rbac';
import { operationState } from '@shared/utils/operation-state';

interface ModuleGroup {
  module: string;
  permissions: Permission[];
}

/**
 * Otorgamientos EXTRA de un usuario específico — aditivos sobre los permisos
 * y organizaciones de su rol, sin modificar el rol en sí (ver
 * RoleEditPage para editar lo que otorga el rol). Un usuario puede tener,
 * por ejemplo, rol "analista" pero acceso extra de escritura a un solo
 * módulo, o acceso a una organización fuera de las de su rol.
 */
@Component({
  selector: 'app-user-extra-grants',
  imports: [FormsModule, Checkbox, MultiSelect, ButtonDirective, ButtonLabel],
  templateUrl: './user-extra-grants.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserExtraGrants {
  readonly #rbacApi = inject(RbacApi);
  readonly #message = inject(MessageService);
  protected readonly organizationsCatalog = inject(OrganizationsCatalog);

  readonly userId = input.required<number>();

  readonly #catalog = toSignal(this.#rbacApi.getPermissionsCatalog(), { initialValue: [] as Permission[] });
  readonly loading = signal(true);
  readonly selectedPermissionIds = signal<Set<number>>(new Set());
  readonly selectedOrganizationIds = signal<number[]>([]);

  protected readonly savePermissionsOp = operationState();
  protected readonly saveOrganizationsOp = operationState();
  protected readonly moduleLabel = moduleLabel;

  readonly moduleGroups = computed<ModuleGroup[]>(() => {
    const byModule = new Map<string, Permission[]>();
    for (const permission of this.#catalog()) {
      const list = byModule.get(permission.module) ?? [];
      list.push(permission);
      byModule.set(permission.module, list);
    }
    return [...byModule.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, permissions]) => ({ module, permissions }));
  });

  constructor() {
    // input.required() no tiene valor garantizado dentro del cuerpo síncrono
    // del constructor — Angular exige leerlo desde un effect() (se ejecuta
    // tras la fase de inicialización de bindings).
    effect(() => {
      this.#rbacApi.getUserExtraGrants(this.userId()).subscribe({
        next: (grants) => {
          this.selectedPermissionIds.set(new Set(grants.extraPermissions.map((p) => p.id)));
          this.selectedOrganizationIds.set([...grants.extraOrganizationIds]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }

  togglePermission(permissionId: number): void {
    const next = new Set(this.selectedPermissionIds());
    if (next.has(permissionId)) next.delete(permissionId);
    else next.add(permissionId);
    this.selectedPermissionIds.set(next);
  }

  savePermissions(): void {
    this.savePermissionsOp
      .run(this.#rbacApi.setUserExtraPermissions(this.userId(), [...this.selectedPermissionIds()]))
      .subscribe({
        next: () => this.#notifySuccess('Permisos extra actualizados.'),
        error: () => this.#notifyError('No se pudieron actualizar los permisos extra.'),
      });
  }

  saveOrganizations(): void {
    this.saveOrganizationsOp
      .run(this.#rbacApi.setUserExtraOrganizations(this.userId(), this.selectedOrganizationIds()))
      .subscribe({
        next: () => this.#notifySuccess('Organizaciones extra actualizadas.'),
        error: () => this.#notifyError('No se pudieron actualizar las organizaciones extra.'),
      });
  }

  #notifySuccess(detail: string): void {
    this.#message.add({ severity: 'success', summary: 'Listo', detail });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }
}
