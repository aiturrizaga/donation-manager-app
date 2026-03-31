import { Component, inject } from '@angular/core';
import { PageTitleFacade } from '../../facades/page-title.facade';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  protected readonly pageTitle = inject(PageTitleFacade);
}
