ARG NODE_VERSION=22.16.0
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm prisma generate && pnpm build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN corepack enable \
  && pnpm install --frozen-lockfile --prod --ignore-scripts \
  && pnpm exec prisma generate

FROM base AS runner
ENV NODE_ENV=production \
    PORT=8080 \
    SKIP_MIGRATIONS=0 \
    MIGRATION_RETRIES=3 \
    MIGRATION_RETRY_DELAY=3

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=prod-deps /app/prisma ./prisma
COPY package.json .

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT||8080) + '/health', r => { if(r.statusCode<400) process.exit(0); process.exit(1); }).on('error', ()=>process.exit(1))" || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
