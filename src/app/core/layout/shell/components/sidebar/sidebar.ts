import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  groups = input.required<MenuItem[]>();
  collapsed = input<boolean>(false);
  hideCollapseBtn = input<boolean>(false);
  mobileOpen = input<boolean>(false);

  collapseToggled = output<boolean>();
  mobileClose = output<void>();

  sidebarWidth = computed<string>(() => (this.collapsed() ? 'calc(0.25rem * 13)' : '256px'));

  onCollapseClick(): void {
    this.collapseToggled.emit(!this.collapsed());
  }
}
