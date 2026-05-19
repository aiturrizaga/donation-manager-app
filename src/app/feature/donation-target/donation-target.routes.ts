import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Objetivos para donaciones',
    data: { breadcrumb: 'Objetivos' },
    loadComponent: () =>
      import('./pages/donation-target-list/donation-target-list').then(
        (c) => c.DonationTargetListPage,
      ),
  },
];
