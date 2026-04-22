import { Component, inject, OnInit, output } from '@angular/core';
import { PageTitleFacade } from '../../facades/page-title.facade';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, MultiSelectModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  protected readonly pageTitle = inject(PageTitleFacade);
  menuClick = output<void>();

  organizations!: { name: string; code: string }[];
  selectedOrganizations!: any[];

  ngOnInit() {
    this.organizations = [
      { name: 'ADEU', code: 'adeu' },
      { name: 'ACES', code: 'aces' },
      { name: 'DEMO', code: 'otro' },
    ];
  }
}
