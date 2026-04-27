import { Routes } from '@angular/router';
import { ShellLayout } from '@core/layout/shell/shell-layout';
import { Dashboard } from './feature/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [
      {
        title: 'Dashboard',
        path: 'dashboard',
        component: Dashboard,
      },
      {
        title: 'Organizaciones',
        path: 'organizations',
        loadChildren: () =>
          import('./feature/organization/organization.routes').then((m) => m.routes),
      },
    ],
  },
];
