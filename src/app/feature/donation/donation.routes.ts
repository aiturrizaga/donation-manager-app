import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/donation-list/donation-list').then((c) => c.DonationListPage),
  },
];
