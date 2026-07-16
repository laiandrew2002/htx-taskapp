# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache wget

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY prisma ./prisma/

EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
