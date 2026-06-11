export const environment = {
  production: true,
  apiUrl: 'https://api.adeu.org.pe/api',
  keycloak: {
    config: {
      url: 'https://identity.adeu.org.pe',
      realm: 'donation-hub-staging',
      clientId: 'donation-manager-app',
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
    },
  },
};
