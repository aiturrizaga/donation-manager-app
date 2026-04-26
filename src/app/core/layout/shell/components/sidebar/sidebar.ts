import { Component, computed, input, output, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Avatar, Menu, Tooltip],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: {
    class: 'contents',
  },
})
export class Sidebar {
  navItems = input.required<MenuItem[]>();
  collapsed = input<boolean>(false);
  collapseToggled = output<boolean>();

  userMenu = viewChild.required<Menu>('userMenu');

  sidebarWidth = computed<string>(() => (this.collapsed() ? '52px' : '256px'));

  readonly userMenuItems: MenuItem[] = [
    {
      label: 'john.smith@adeu.edu.pe',
      disabled: true,
    },
    { separator: true },
    {
      label: 'Mi perfil',
      icon: 'ti ti-user',
      routerLink: '/configuracion/perfil',
    },
    {
      label: 'Configuración',
      icon: 'ti ti-settings',
      routerLink: '/configuracion',
    },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'ti ti-logout',
      styleClass: 'user-menu-item--danger',
    },
  ];

  onCollapseClick(): void {
    this.collapseToggled.emit(!this.collapsed());
  }

  onUserMenuToggle(event: MouseEvent): void {
    this.userMenu().toggle(event);
  }
}
