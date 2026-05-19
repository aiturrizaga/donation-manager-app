import { Routes } from '@angular/router';
import { donorResolver } from './resolvers/donor-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/donor-list/donor-list').then((c) => c.DonorListPage),
  },
  {
    path: ':id',
    resolve: { donor: donorResolver },
    loadComponent: () =>
      import('./pages/donor-profile/donor-profile').then((c) => c.DonorProfilePage),
  },
];
