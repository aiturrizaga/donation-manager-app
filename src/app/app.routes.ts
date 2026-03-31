import { Routes } from '@angular/router';
import { ShellLayout } from './core/layout/shell/shell-layout';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadChildren: () => import('./feature/dashboard/dashboard.routes').then((m) => m.routes),
      },
      {
        path: 'donaciones',
        title: 'Donaciones',
        loadChildren: () => import('./feature/donation/donation.routes').then((m) => m.routes),
      },
      {
        path: 'donantes',
        title: 'Donantes',
        loadChildren: () => import('./feature/donor/donor.routes').then((m) => m.routes),
      },
    ],
  },
];
