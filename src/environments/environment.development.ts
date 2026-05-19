export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api',
  keycloak: {
    config: {
      url: 'https://identity.medgama.com',
      realm: 'donation-manager',
      clientId: 'donation-manager-app',
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
    },
  },
};
