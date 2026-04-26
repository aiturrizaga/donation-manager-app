import { Component, inject, OnInit, output } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { NavApi } from '@core/layout/shell/api';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, MultiSelectModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  host: {
    class: 'contents',
  },
})
export class Navbar implements OnInit {
  protected readonly navApi = inject(NavApi);
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
