import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-list/user-list').then((c) => c.UserListPage),
  },
];
