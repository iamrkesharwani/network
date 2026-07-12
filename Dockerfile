FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/client/package.json packages/client/package.json
COPY packages/server/package.json packages/server/package.json
RUN npm ci

COPY tsconfig.json ./
COPY packages/shared packages/shared
COPY packages/client packages/client
COPY packages/server packages/server

RUN npm run build:shared \
  && npm run build --workspace=@network/client \
  && npm run build --workspace=@network/server \
  && npm prune --omit=dev

FROM node:20-slim AS runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/packages/shared/package.json packages/shared/package.json
COPY --from=builder /app/packages/shared/dist packages/shared/dist

COPY --from=builder /app/packages/client/package.json packages/client/package.json
COPY --from=builder /app/packages/client/dist packages/client/dist

COPY --from=builder /app/packages/server/package.json packages/server/package.json
COPY --from=builder /app/packages/server/dist packages/server/dist

EXPOSE 5000
CMD ["node", "packages/server/dist/server.js"]
