FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

FROM oven/bun:1-alpine AS build

WORKDIR /app

ARG VITE_PUBLIC_SUPABASE_URL
ARG VITE_PUBLIC_SUPABASE_ANON_KEY
ARG VITE_PUBLIC_SITE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build-only

FROM nginx:alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY conf/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
