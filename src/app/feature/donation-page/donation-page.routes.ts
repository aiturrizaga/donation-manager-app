import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { donationPageResolver } from './resolvers/donation-page-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/donation-page-list/donation-page-list').then((c) => c.DonationPageListPage),
  },
  {
    path: ':id',
    resolve: { page: donationPageResolver },
    // El título de pestaña se setea desde el componente (ver DonationPageDetail):
    // Route.title como función no puede leer route.data de OTRO resolver — ambos
    // se resuelven en paralelo, así que route.data['page'] aún no existe cuando
    // Angular invoca esta función. El breadcrumb sí funciona como función porque
    // NavApi lo evalúa después de que la navegación completa (NavigationEnd).
    data: { breadcrumb: (route: ActivatedRouteSnapshot) => route.data['page']?.name },
    loadComponent: () =>
      import('./pages/donation-page-detail/donation-page-detail').then((c) => c.DonationPageDetail),
  },
];
