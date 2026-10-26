import { isDevMode } from '@angular/core';

export const environment = {
  production: !isDevMode(),
  apiUrl: import.meta.env.NG_APP_API_URL,
  keycloak: {
    config: {
      url: import.meta.env.NG_APP_KEYCLOAK_URL,
      realm: import.meta.env.NG_APP_KEYCLOAK_REALM,
      clientId: import.meta.env.NG_APP_KEYCLOAK_CLIENT_ID,
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
    },
  },
};
