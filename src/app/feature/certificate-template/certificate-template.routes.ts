import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Plantilla de certificado',
    data: { breadcrumb: 'Plantilla de certificado' },
    loadComponent: () =>
      import('./pages/certificate-template-page/certificate-template-page').then(
        (c) => c.CertificateTemplatePage,
      ),
  },
];
