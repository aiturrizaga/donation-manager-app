import { Routes } from '@angular/router';
import { ShellLayout } from '@core/layout/shell/shell-layout';
import { authGuard } from '@core/guards';
import { Dashboard } from './feature/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        title: 'Dashboard',
        path: 'dashboard',
        data: { breadcrumb: 'Dashboard' },
        component: Dashboard,
      },
      {
        title: 'Organizaciones',
        path: 'organizations',
        data: { breadcrumb: 'Organizaciones' },
        loadChildren: () =>
          import('./feature/organization/organization.routes').then((m) => m.routes),
      },
      {
        title: 'Usuarios',
        path: 'users',
        data: { breadcrumb: 'Usuarios' },
        loadChildren: () => import('./feature/user/user.routes').then((m) => m.routes),
      },
      {
        title: 'Donantes',
        path: 'donors',
        data: { breadcrumb: 'Donantes' },
        loadChildren: () => import('./feature/donor/donor.routes').then((m) => m.routes),
      },
      {
        title: 'Donaciones',
        path: 'donations',
        data: { breadcrumb: 'Donaciones' },
        loadChildren: () => import('./feature/donation/donation.routes').then((m) => m.routes),
      },
      {
        title: 'Páginas',
        path: 'pages',
        data: { breadcrumb: 'Páginas' },
        loadChildren: () =>
          import('./feature/donation-page/donation-page.routes').then((m) => m.routes),
      },
      {
        title: 'Formularios',
        path: 'forms',
        data: { breadcrumb: 'Formularios' },
        loadChildren: () =>
          import('./feature/donation-form/donation-form.routes').then((m) => m.routes),
      },
      {
        path: 'settings/targets',
        loadChildren: () =>
          import('./feature/donation-target/donation-target.routes').then((m) => m.routes),
      },
      {
        path: 'settings/payment-gateways',
        loadChildren: () =>
          import('./feature/payment-gateway/payment-gateway.routes').then((r) => r.routes),
      },
    ],
  },
];
