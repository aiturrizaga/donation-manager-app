import { Component, inject, signal } from '@angular/core';
import { NavApi } from './api/nav.api';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Sidebar } from './components/sidebar/sidebar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.scss',
  host: {
    class: 'contents',
  },
})
export class ShellLayout {
  readonly #navApi = inject(NavApi);

  sidebarCollapsed = signal(false);

  sidebarNavigationItems = toSignal(this.#navApi.getNavigationItems(), {
    initialValue: [] as MenuItem[],
  });

  onSidebarCollapseToggled(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}
