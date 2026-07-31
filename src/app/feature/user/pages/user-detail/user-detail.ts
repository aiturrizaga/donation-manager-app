import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Avatar } from 'primeng/avatar';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { User } from '@domain/user';
import { UserApi } from '../../api/user.api';
import { RbacApi } from '@shared/api/rbac.api';
import { UserExtraGrants } from '../../components/user-extra-grants/user-extra-grants';
import { PageTitleService } from '@core/services';

@Component({
  selector: 'app-user-detail-page',
  imports: [FormsModule, Avatar, ButtonDirective, ButtonIcon, Tag, Select, UserExtraGrants],
  templateUrl: './user-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailPage {
  readonly #router = inject(Router);
  readonly #userApi = inject(UserApi);
  readonly #rbacApi = inject(RbacApi);
  readonly #message = inject(MessageService);
  readonly #pageTitle = inject(PageTitleService);

  readonly user = input.required<User>();
  readonly currentUser = signal<User | null>(null);
  readonly resolvedUser = computed(() => this.currentUser() ?? this.user());

  readonly roles = toSignal(this.#rbacApi.getRoles(), { initialValue: [] });
  readonly savingRole = signal(false);

  constructor() {
    // Route.title (función) no puede leer route.data de otro resolver (se
    // resuelven en paralelo) — el título de pestaña se setea aquí en su lugar
    // (mismo patrón que OrganizationDetail).
    effect(() => this.#pageTitle.setPageTitle(this.resolvedUser().partner.name));
  }

  initials(): string {
    return this.resolvedUser()
      .partner.name.split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  onRoleChange(roleId: number): void {
    this.savingRole.set(true);
    this.#userApi.update(this.resolvedUser().id, { roleId }).subscribe({
      next: (updated) => {
        this.currentUser.set(updated);
        this.savingRole.set(false);
        this.#message.add({ severity: 'success', summary: 'Listo', detail: 'Rol actualizado.' });
      },
      error: () => {
        this.savingRole.set(false);
        this.#message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el rol.',
        });
      },
    });
  }

  goBack(): void {
    this.#router.navigate(['/users']).then();
  }
}

