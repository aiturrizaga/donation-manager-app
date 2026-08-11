import { Routes } from '@angular/router';
import { complaintResolver } from './resolvers/complaint-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/complaint-list/complaint-list').then((c) => c.ComplaintListPage),
  },
  {
    path: ':id',
    resolve: { complaint: complaintResolver },
    title: 'Detalle de reclamo',
    data: { breadcrumb: 'Detalles' },
    loadComponent: () =>
      import('./pages/complaint-detail/complaint-detail').then((m) => m.ComplaintDetailPage),
  },
];
