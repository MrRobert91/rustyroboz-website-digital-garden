FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/package.json ./apps/web/package.json
COPY . .
RUN npm run build --workspace @rustyroboz/web

FROM node:24-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV CONTENT_ROOT=/app/content
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/content ./content
EXPOSE 3000
WORKDIR /app/apps/web
CMD ["node", "server.js"]

