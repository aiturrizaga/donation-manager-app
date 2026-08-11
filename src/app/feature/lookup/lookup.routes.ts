import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { lookupResolver } from './resolvers/lookup-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/lookup-list/lookup-list').then((c) => c.LookupListPage),
  },
  {
    path: ':id',
    resolve: { lookup: lookupResolver },
    data: { breadcrumb: (route: ActivatedRouteSnapshot) => route.data['lookup']?.name },
    loadComponent: () => import('./pages/lookup-detail/lookup-detail').then((c) => c.LookupDetailPage),
  },
];
