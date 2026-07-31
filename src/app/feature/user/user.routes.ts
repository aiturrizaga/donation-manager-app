import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { userResolver } from './resolvers/user-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-list/user-list').then((c) => c.UserListPage),
  },
  {
    path: ':id',
    resolve: { user: userResolver },
    data: {
      breadcrumb: (route: ActivatedRouteSnapshot) => route.data['user']?.partner?.name,
    },
    loadComponent: () => import('./pages/user-detail/user-detail').then((c) => c.UserDetailPage),
  },
];
