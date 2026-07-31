import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { organizationResolver } from './resolvers/organization-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/organization-list/organization-list').then((c) => c.OrganizationListPage),
  },
  {
    path: ':id',
    resolve: { organization: organizationResolver },
    // Route.title (función) no puede leer route.data de otro resolver (se
    // resuelven en paralelo) — el título de pestaña se setea desde el
    // componente en su lugar (ver DonationPageDetail para el mismo patrón).
    data: { breadcrumb: (route: ActivatedRouteSnapshot) => route.data['organization']?.legalName },
    loadComponent: () =>
      import('./pages/organization-detail/organization-detail').then((c) => c.OrganizationDetail),
  },
];
