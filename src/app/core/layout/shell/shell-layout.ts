import { Component, HostListener, inject } from '@angular/core';
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
})
export class ShellLayout {
  private readonly navApi = inject(NavApi);

  sidebarGroups = toSignal(this.navApi.getSidebarGroups(), {
    initialValue: [] as MenuItem[],
  });

  @HostListener('window:resize')
  onResize(): void {}
}
