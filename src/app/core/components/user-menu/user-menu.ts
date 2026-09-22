import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Skeleton } from 'primeng/skeleton';
import { ProfileCard } from '@shared/components';
import Keycloak from 'keycloak-js';
import { CurrentUserService } from '@core/services/current-user.service';
import { getInitials } from '@shared/utils/string.util';
import { ThemeMode, ThemeService } from '@core/theme';

interface BasicProfileClaims {
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
}

@Component({
  selector: 'app-user-menu',
  imports: [Menu, Skeleton, PrimeTemplate, ProfileCard],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  readonly #keycloak = inject(Keycloak);
  readonly #currentUser = inject(CurrentUserService);
  readonly #themeService = inject(ThemeService);

  // Sin loading real: el nombre/correo salen del propio access token
  // (ya decodificado en memoria por keycloak-js), no de una llamada a la
  // Account REST API de Keycloak — esa API exige el scope/rol "account",
  // que este realm ya no otorga por defecto a donation-manager-app, así que
  // keycloak.loadUserProfile() ahora devuelve 401 en vez de datos.
  readonly loading = signal(false);
  protected readonly menu = viewChild.required<Menu>('menu');

  readonly user = computed(() => {
    const token = this.#keycloak.tokenParsed as BasicProfileClaims | undefined;
    const fullName =
      token?.name || [token?.given_name, token?.family_name].filter(Boolean).join(' ');

    return {
      fullName,
      role: this.#currentUser.role()?.displayName ?? '',
      email: token?.email ?? '',
      initials: getInitials(fullName, true),
    };
  });

  readonly menuItems = computed<MenuItem[]>(() => {
    const currentMode = this.#themeService.mode();

    return [
      { label: 'Mi perfil', icon: 'ti ti-user', routerLink: '/configuracion/perfil' },
      { label: 'Configuración', icon: 'ti ti-settings', routerLink: '/configuracion' },
      { separator: true },
      {
        label: `
          <div class="theme-picker">
            <span class="theme-picker__label">Tema</span>
            <div class="theme-picker__options">
              <button class="theme-picker__btn ${currentMode === 'light' ? 'is-active' : ''}" data-mode="light" aria-label="Claro">
                <i class="ti ti-sun"></i>
              </button>
              <button class="theme-picker__btn ${currentMode === 'dark' ? 'is-active' : ''}" data-mode="dark" aria-label="Oscuro">
                <i class="ti ti-moon"></i>
              </button>
              <button class="theme-picker__btn ${currentMode === 'system' ? 'is-active' : ''}" data-mode="system" aria-label="Predeterminado del sistema">
                <i class="ti ti-device-laptop"></i>
              </button>
            </div>
          </div>
        `,
        escape: false,
        styleClass: 'user-menu-item--theme',
        command: (event) => {
          const target = event.originalEvent?.target as HTMLElement | undefined;
          const mode = target?.closest('[data-mode]')?.getAttribute('data-mode') as
            | ThemeMode
            | null;
          if (mode) this.#themeService.setMode(mode);
        },
      },
      { separator: true },
      {
        label: 'Cerrar sesión',
        icon: 'ti ti-logout',
        styleClass: 'user-menu-item--danger',
        command: () => this.#logout(),
      },
    ];
  });

  onToggle(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  #logout(): void {
    this.#keycloak.logout({ redirectUri: window.location.origin }).catch(() => {});
  }
}
