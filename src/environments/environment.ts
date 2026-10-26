const env = import.meta.env;

export const environment = {
  production: env.NG_APP_ENV === 'production',
  apiUrl: env.NG_APP_API_URL,
  keycloak: {
    config: {
      url: env.NG_APP_KEYCLOAK_URL,
      realm: env.NG_APP_KEYCLOAK_REALM,
      clientId: env.NG_APP_KEYCLOAK_CLIENT_ID,
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
    },
  },
};
