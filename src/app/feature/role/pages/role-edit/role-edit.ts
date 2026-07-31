import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { MultiSelect } from 'primeng/multiselect';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { RbacApi } from '@shared/api/rbac.api';
import { OrganizationsCatalog } from '@shared/api/organizations-catalog';
import { moduleLabel, Permission, Role } from '@domain/rbac';
import { operationState } from '@shared/utils/operation-state';

interface ModuleGroup {
  module: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-role-edit-page',
  imports: [FormsModule, Checkbox, MultiSelect, ButtonDirective, ButtonIcon, ButtonLabel, Tag],
  templateUrl: './role-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleEditPage {
  readonly #rbacApi = inject(RbacApi);
  readonly #router = inject(Router);
  readonly #message = inject(MessageService);
  protected readonly organizationsCatalog = inject(OrganizationsCatalog);

  readonly role = input.required<Role>();
  readonly currentRole = signal<Role | null>(null);
  readonly resolvedRole = computed(() => this.currentRole() ?? this.role());

  readonly #catalog = toSignal(this.#rbacApi.getPermissionsCatalog(), { initialValue: [] as Permission[] });

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

  readonly selectedPermissionIds = signal<Set<number>>(new Set());
  readonly selectedOrganizationIds = signal<number[]>([]);

  protected readonly savePermissionsOp = operationState();
  protected readonly saveOrganizationsOp = operationState();

  constructor() {
    // input.required() no tiene valor garantizado en el cuerpo síncrono del
    // constructor — se lee desde un effect(), que además resincroniza los
    // sets editables cada vez que resolvedRole() cambie (ej. tras guardar).
    effect(() => {
      const role = this.resolvedRole();
      this.selectedPermissionIds.set(new Set(role.permissions.map((p) => p.id)));
      this.selectedOrganizationIds.set([...role.organizationIds]);
    });
  }

  protected readonly moduleLabel = moduleLabel;

  isModuleFullySelected(group: ModuleGroup): boolean {
    const selected = this.selectedPermissionIds();
    return group.permissions.every((p) => selected.has(p.id));
  }

  isModulePartiallySelected(group: ModuleGroup): boolean {
    const selected = this.selectedPermissionIds();
    const count = group.permissions.filter((p) => selected.has(p.id)).length;
    return count > 0 && count < group.permissions.length;
  }

  togglePermission(permissionId: number): void {
    const next = new Set(this.selectedPermissionIds());
    if (next.has(permissionId)) next.delete(permissionId);
    else next.add(permissionId);
    this.selectedPermissionIds.set(next);
  }

  toggleModule(group: ModuleGroup): void {
    const next = new Set(this.selectedPermissionIds());
    const shouldSelectAll = !this.isModuleFullySelected(group);
    for (const permission of group.permissions) {
      if (shouldSelectAll) next.add(permission.id);
      else next.delete(permission.id);
    }
    this.selectedPermissionIds.set(next);
  }

  savePermissions(): void {
    const role = this.resolvedRole();
    this.savePermissionsOp
      .run(this.#rbacApi.setRolePermissions(role.id, [...this.selectedPermissionIds()]))
      .subscribe({
        next: (updated) => {
          this.currentRole.set(updated);
          this.#notifySuccess('Permisos actualizados.');
        },
        error: () => this.#notifyError('No se pudieron actualizar los permisos.'),
      });
  }

  saveOrganizations(): void {
    const role = this.resolvedRole();
    this.saveOrganizationsOp
      .run(this.#rbacApi.setRoleOrganizations(role.id, this.selectedOrganizationIds()))
      .subscribe({
        next: (updated) => {
          this.currentRole.set(updated);
          this.#notifySuccess('Organizaciones actualizadas.');
        },
        error: () => this.#notifyError('No se pudieron actualizar las organizaciones.'),
      });
  }

  goBack(): void {
    this.#router.navigate(['/roles']).then();
  }

  #notifySuccess(detail: string): void {
    this.#message.add({ severity: 'success', summary: 'Listo', detail });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }
}
