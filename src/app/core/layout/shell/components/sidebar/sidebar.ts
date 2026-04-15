import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  /** Nav groups from ShellComponent — MenuItem[] shape, built by NavApi */
  groups = input.required<MenuItem[]>();

  collapsed = signal(false);

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }
}
