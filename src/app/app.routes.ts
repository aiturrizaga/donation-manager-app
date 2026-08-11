import { Routes } from '@angular/router';
import { ShellLayout } from '@core/layout/shell/shell-layout';
import { authGuard, permissionGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: 'mantenimiento',
    loadComponent: () =>
      import('./feature/maintenance/maintenance-page').then((m) => m.MaintenancePage),
  },
  {
    // Fuera del shell a propósito — ver el comentario en AccessDeniedPage
    // sobre por qué esta ruta NO puede llevar authGuard.
    path: 'acceso-denegado',
    loadComponent: () =>
      import('./feature/access-denied/access-denied-page').then((m) => m.AccessDeniedPage),
  },
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
        loadChildren: () =>
          import('./feature/dashboard/dashboard.routes').then((m) => m.routes),
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
        title: 'Roles y permisos',
        path: 'roles',
        canActivate: [permissionGuard('rbac:read')],
        data: { breadcrumb: 'Roles y permisos' },
        loadChildren: () => import('./feature/role/role.routes').then((m) => m.routes),
      },
      {
        title: 'Reclamos',
        path: 'complaints',
        canActivate: [permissionGuard('complaint:read')],
        data: { breadcrumb: 'Reclamos' },
        loadChildren: () => import('./feature/complaint/complaint.routes').then((m) => m.routes),
      },
      {
        title: 'Legales',
        path: 'legal-pages',
        canActivate: [permissionGuard('legal_page:read')],
        data: { breadcrumb: 'Legales' },
        loadChildren: () => import('./feature/legal-page/legal-page.routes').then((m) => m.routes),
      },
      {
        title: 'Catálogos del sistema',
        path: 'settings/lookups',
        canActivate: [permissionGuard('lookup:read')],
        data: { breadcrumb: 'Catálogos del sistema' },
        loadChildren: () => import('./feature/lookup/lookup.routes').then((m) => m.routes),
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
      {
        // Debe ser el último hijo — el router prueba las rutas en orden y
        // esta matchea cualquier cosa. Angular no cambia la URL al matchear
        // un wildcard: la barra de direcciones queda tal cual la escribió el
        // usuario, solo se reemplaza el contenido (sin skipLocationChange).
        path: '**',
        title: 'Página no encontrada',
        loadComponent: () =>
          import('./feature/not-found/not-found-page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
