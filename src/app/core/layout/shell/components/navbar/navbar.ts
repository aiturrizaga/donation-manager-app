import { Component, computed, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { NavApi } from '@core/layout/shell/api';
import { UserMenu } from '@core/components';

@Component({
  selector: 'app-navbar',
  imports: [ButtonDirective, UserMenu, Breadcrumb],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  protected readonly navApi = inject(NavApi);

  readonly visibleBreadcrumb = computed<MenuItem[]>(() => {
    const items = this.navApi.breadcrumb();
    if (items.length <= 3) return items;

    return [items[0], { label: '...', disabled: true }, items[items.length - 1]];
  });

  onSearchClick(): void {}
}
