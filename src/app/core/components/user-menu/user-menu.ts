import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Skeleton } from 'primeng/skeleton';
import { ProfileCard } from '@shared/components';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { getInitials } from '@shared/utils/string.util';

@Component({
  selector: 'app-user-menu',
  imports: [Menu, Skeleton, PrimeTemplate, ProfileCard],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  readonly #keycloak = inject(Keycloak);

  readonly loading = signal(true);
  readonly #profile = signal<KeycloakProfile | null>(null);
  protected readonly menu = viewChild.required<Menu>('menu');

  readonly user = computed(() => {
    const profile = this.#profile();
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');

    return {
      fullName,
      role: 'Admin',
      email: profile?.email ?? '',
      initials: getInitials(fullName, true),
    };
  });

  readonly menuItems: MenuItem[] = [
    { label: 'Mi perfil', icon: 'ti ti-user', routerLink: '/configuracion/perfil' },
    { label: 'Configuración', icon: 'ti ti-settings', routerLink: '/configuracion' },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'ti ti-logout',
      styleClass: 'user-menu-item--danger',
      command: () => this.#logout(),
    },
  ];

  constructor() {
    this.#loadProfile();
  }

  onToggle(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  #loadProfile(): void {
    this.#keycloak
      .loadUserProfile()
      .then((profile) => {
        this.#profile.set(profile);
        this.loading.set(false);
      })
      .catch(() => {
        this.#profile.set(null);
        this.loading.set(false);
      });
  }

  #logout(): void {
    this.#keycloak.logout({ redirectUri: window.location.origin }).catch(() => {});
  }
}
