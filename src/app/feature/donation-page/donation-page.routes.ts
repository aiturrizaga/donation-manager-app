import { Routes } from '@angular/router';
import { donationPageResolver } from './resolvers/donation-page-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/donation-page-list/donation-page-list').then((c) => c.DonationPageListPage),
  },
  {
    path: ':id',
    resolve: { page: donationPageResolver },
    loadComponent: () =>
      import('./pages/donation-page-detail/donation-page-detail').then((c) => c.DonationPageDetail),
  },
];
