FROM node:24.0.0-alpine3.21 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27.4-alpine3.21

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=appuser:appgroup /app/dist/*/browser /usr/share/nginx/html
COPY --chown=appuser:appgroup .env.template /app/.env.template
COPY --chown=appuser:appgroup entrypoint.sh /entrypoint.sh

RUN chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid && \
    mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R appuser:appgroup /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    sed -i 's/\r$//' /entrypoint.sh && \
    chmod +x /entrypoint.sh

USER appuser

# No defaults are set here on purpose: this container must always be run with
# all variables listed in .env.template passed explicitly, e.g.
#   docker run -e NG_APP_API_URL=... -e NG_APP_KEYCLOAK_URL=... \
#     -e NG_APP_KEYCLOAK_REALM=... -e NG_APP_KEYCLOAK_CLIENT_ID=... ...
# Omitting one leaves it as an empty string in ngx-env.js (see entrypoint.sh).

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
