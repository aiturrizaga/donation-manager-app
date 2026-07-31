import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { donorResolver } from './resolvers/donor-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/donor-list/donor-list').then((c) => c.DonorListPage),
  },
  {
    path: ':id',
    resolve: { donor: donorResolver },
    // Título de pestaña seteado desde DonorProfilePage (ver nota en donation-page.routes.ts).
    data: { breadcrumb: (route: ActivatedRouteSnapshot) => route.data['donor']?.partner?.name },
    loadComponent: () =>
      import('./pages/donor-profile/donor-profile').then((c) => c.DonorProfilePage),
  },
];
