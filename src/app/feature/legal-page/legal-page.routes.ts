import { Routes } from '@angular/router';
import { legalPageResolver } from './resolvers/legal-page-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/legal-page-list/legal-page-list').then((c) => c.LegalPageListPage),
  },
  {
    path: ':id',
    resolve: { legalPage: legalPageResolver },
    title: 'Detalle de página legal',
    data: { breadcrumb: 'Detalles' },
    loadComponent: () =>
      import('./pages/legal-page-detail/legal-page-detail').then((m) => m.LegalPageDetailPage),
  },
];
