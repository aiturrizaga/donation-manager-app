import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PageTitleService extends TitleStrategy {
  readonly #title = inject(Title);
  readonly #appName = 'DonationHub Manager';

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const dynamicTitle = this.#resolveDeepestDataTitle(snapshot.root);
    const staticTitle = this.buildTitle(snapshot);
    const title = dynamicTitle ?? staticTitle ?? '';
    this.setPageTitle(title);
  }

  setPageTitle(title: string): void {
    this.#title.setTitle(title ? `${title} | ${this.#appName}` : this.#appName);
  }

  #resolveDeepestDataTitle(route: ActivatedRouteSnapshot | null): string | null {
    let result: string | null = null;
    let current = route;
    while (current) {
      if (current.data?.['title']) result = current.data['title'];
      current = current.firstChild;
    }
    return result;
  }
}
