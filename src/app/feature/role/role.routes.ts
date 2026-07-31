import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { roleResolver } from './resolvers/role-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/role-list/role-list').then((c) => c.RoleListPage),
  },
  {
    path: ':id',
    resolve: { role: roleResolver },
    data: { breadcrumb: (route: ActivatedRouteSnapshot) => route.data['role']?.displayName },
    loadComponent: () => import('./pages/role-edit/role-edit').then((c) => c.RoleEditPage),
  },
];
