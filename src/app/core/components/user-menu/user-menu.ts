import { Component, signal, viewChild } from '@angular/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ProfileCard } from '@shared/components';

@Component({
  selector: 'app-user-menu',
  imports: [Menu, PrimeTemplate, ProfileCard],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  protected readonly menu = viewChild.required<Menu>('menu');

  readonly user = signal({ fullName: 'John Smith', role: 'Admin', email: 'john.smith@wowperu.pe' });
  readonly initials = signal<string>('JS');

  readonly menuItems: MenuItem[] = [
    { label: 'Mi perfil', icon: 'ti ti-user', routerLink: '/configuracion/perfil' },
    { label: 'Configuración', icon: 'ti ti-settings', routerLink: '/configuracion' },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'ti ti-logout',
      styleClass: 'user-menu-item--danger',
      command: () => this.logout(),
    },
  ];

  onToggle(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  logout(): void {}
}
