import { Component, input, signal } from '@angular/core';
import { NavGroup } from '../../../../../shared/models/nav-item.model';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  /** Nav groups passed from ShellComponent, built by NavService */
  groups = input.required<NavGroup[]>();

  collapsed = signal(false);

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }
}
