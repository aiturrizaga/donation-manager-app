import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/donation-form-list/donation-form-list').then((c) => c.DonationFormListPage),
  },
];
