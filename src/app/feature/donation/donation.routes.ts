import { Routes } from '@angular/router';
import { donationResolver } from './resolvers/donation-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/donation-list/donation-list').then((c) => c.DonationListPage),
  },
  {
    path: ':id',
    resolve: { donation: donationResolver },
    loadComponent: () =>
      import('./pages/donation-detail/donation-detail').then((m) => m.DonationDetailPage),
  },
];
