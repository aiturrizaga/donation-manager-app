import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Pasarelas de pago',
    data: { breadcrumb: 'Pasarelas de pago' },
    loadComponent: () =>
      import('./pages/payment-gateway-list/payment-gateway-list').then(
        (c) => c.PaymentGatewayListPage,
      ),
  },
];
