import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';

import { SystemPreset } from '@core/theme';
import {
  provideAppTitle,
  provideKeycloakAngular,
  provideKeycloakTokenInterceptor,
} from '@core/providers';
import { routes } from './app.routes';
import { includeBearerTokenInterceptor } from 'keycloak-angular';

registerLocaleData(localeEsPe);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([includeBearerTokenInterceptor])),
    provideKeycloakAngular(),
    provideKeycloakTokenInterceptor(),
    providePrimeNG({
      theme: {
        preset: SystemPreset,
      },
    }),
    provideAppTitle(),
  ],
};
