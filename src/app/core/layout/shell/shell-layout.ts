import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { NavApi } from '@core/layout/shell/api';
import { Navbar } from '@core/layout/shell/components/navbar/navbar';
import { Sidebar } from '@core/layout/shell/components/sidebar/sidebar';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, Navbar, Sidebar, ConfirmDialog],
  providers: [ConfirmationService],
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
