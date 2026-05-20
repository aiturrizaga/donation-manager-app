export const environment = {
  production: true,
  apiUrl: 'https://donation-manager-api.onrender.com/api',
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
