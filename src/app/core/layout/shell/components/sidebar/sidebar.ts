import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Tooltip],
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

  sidebarWidth = computed<string>(() => (this.collapsed() ? '52px' : '256px'));

  readonly expandedItems = signal<Set<string>>(new Set());

  isGroup(item: MenuItem): boolean {
    return !item.routerLink && !!item.items && !!item.label;
  }

  isExpanded(id: string): boolean {
    return this.expandedItems().has(id);
  }

  getParentRouterLink(item: MenuItem): string {
    return (item.items?.[0]?.routerLink as string) ?? '';
  }

  toggleAccordion(id: string): void {
    this.expandedItems.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  onCollapseClick(): void {
    this.collapseToggled.emit(!this.collapsed());
  }
}
