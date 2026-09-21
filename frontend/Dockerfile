# ── Stage 1: Build ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Caché de dependencias npm
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Compilar Angular para producción
COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Runtime (Nginx) ────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
