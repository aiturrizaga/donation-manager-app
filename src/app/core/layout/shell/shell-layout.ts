import { Component, HostListener, inject } from '@angular/core';
import { NavApi } from './api/nav.api';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { BottomNav } from './components/bottom-nav/bottom-nav';
import { Sidebar } from './components/sidebar/sidebar';
import { NavGroup, NavItem } from '../../../shared/models/nav-item.model';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Navbar, Sidebar, BottomNav],
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.scss',
})
export class ShellLayout {
  private readonly navService = inject(NavApi);

  /** Grouped nav items for the sidebar — built by NavService */
  sidebarGroups = toSignal(this.navService.getSidebarGroups(), {
    initialValue: [] as NavGroup[],
  });

  /** Flat bottom nav items — capped at 4 by NavService */
  bottomNavItems = toSignal(this.navService.getBottomNavItems(), {
    initialValue: [] as NavItem[],
  });

  /** Reserved for future resize logic (e.g. closing a mobile search overlay) */
  @HostListener('window:resize')
  onResize(): void {}
}
