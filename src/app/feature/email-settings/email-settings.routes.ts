import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Configuración SMTP',
    data: { breadcrumb: 'Configuración SMTP' },
    loadComponent: () =>
      import('./pages/email-settings-page/email-settings-page').then((c) => c.EmailSettingsPage),
  },
];
