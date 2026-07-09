# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A social network / media platform (long-form video, shorts, and posts) built as an npm-workspaces monorepo with three packages:

- `@network/shared` — Zod schemas, TypeScript types, constants, and utils shared by client and server. **Build this first** — the others depend on its compiled output resolved via `paths` (dev) or `dist` (prod).
- `@network/server` — Express 5 + Socket.io + MongoDB (Mongoose) + Redis/BullMQ API server, which also hosts the client via SSR.
- `@network/client` — React 19 + Redux Toolkit + RTK Query + Vite + Tailwind CSS 4 SPA with SSR entry points.

## Commands

Run from repo root unless noted. Package manager is npm (Node >=20, npm >=10).

```bash
# Dev — run server and client together (server proxies client via Vite middleware SSR)
npm run dev                    # all workspaces
npm run dev:server             # tsx watch, API + SSR on env.PORT
npm run dev:client             # vite standalone (usually not needed; server embeds vite)

# Build (order matters: shared must compile before client/server)
npm run build:shared           # tsc -> packages/shared/dist
npm run build                  # builds shared, then client (client + SSR bundles), then server

# Typecheck everything
npm run typecheck

# Client-only
npm run lint --workspace=@network/client       # eslint
npm run typecheck --workspace=@network/client  # tsc --noEmit

# Production start (after build)
npm run start --workspace=@network/server      # node dist/server.js
```

There is **no test runner configured** in any package. Do not assume `npm test` works.

After changing anything in `packages/shared`, rebuild it (`npm run build:shared`) — the server dev process resolves `@network/shared` through a tsconfig `paths` alias to source, but the client SSR/prod build and `dist` consumers need the compiled output.

## Architecture

### Request lifecycle (server)

`server.ts` boots dependencies in order: Mongo → Redis → Socket.io → email worker → HTTP listen, with a 10s graceful-shutdown handler. `app.ts` builds the Express app; middleware order is significant:

1. `helmet`, `cors` (credentials, `env.CLIENT_URL` origin)
2. **Raw body** for `POST /api/v1/webhook/media` is registered **before** `express.json` so webhook signature verification sees the unparsed payload.
3. `express.json` (10kb), `cookie-parser`, `sanitizeMiddleware`, `apiLimiter`, `compression`
4. CSRF: `GET /api/v1/csrf-token` issues a token; all routes under `API_V1_PREFIX` pass through `validateCsrfToken`.
5. `setupSSR(app)` mounts Vite middleware (dev) or `sirv` static + server-render (prod) and the global `errorHandler` **last**. Any non-API URL falls through to SSR, which renders `entry-server.tsx` into the `<!--ssr-outlet-->` marker of `index.html`.

### Module pattern (server)

Every domain under `src/modules/<name>/` follows the same layering — replicate it for new modules:

```
<name>.routes.ts        # Router; wires middleware + validate({ body/query/params }) + controllers
controllers/            # thin; wrapped in asyncHandler; parse req, call service, send ApiResponse
services/               # business logic (often split: .crud / .upload / .webhook / .mappers)
<name>.repository.ts    # all Mongoose queries live here — controllers/services never touch models directly
<name>.model.ts         # Mongoose schema
<name>.types.ts         # module-local types
```

Cross-cutting conventions:

- Controllers use `asyncHandler(...)` so throws propagate to the central `errorHandler`. Throw `ApiError(statusCode, ErrorCode, message, details?)` — never `res.status().json()` an error directly.
- Responses are wrapped in `ApiResponse` / `ApiPaginatedResponse` util classes.
- Route validation is done by `validate({ body, query, params })` using Zod schemas imported from `@network/shared`. Note the middleware redefines `req.query` via `Object.defineProperty` (Express 5 makes it a getter), so controllers cast `req.query as unknown as T`.
- Auth: `requireAuth` / `optionalAuth` middleware; JWT via `jose`.
- Root router in `route.ts` mounts modules under `/auth`, `/video`, `/short`, `/post`, `/creator`, `/webhook`, `/uploads`.

### Pluggable providers (server)

`src/providers/provider.ts` instantiates three singletons at import time, chosen by env:

- **storage** (`IStorageProvider`): r2 / s3 / backblaze / digitalocean / bunny-storage / azure — all S3-compatible ones reuse `S3StorageProvider`.
- **video** (`IVideoProvider`): cloudflare / mux / bunny-stream.
- **image** (`IImageProvider`): cloudflare / s3-cdn.

Import `storageProvider`, `videoProvider`, `imageProvider` from `provider.ts`; never reference a concrete provider class in feature code. Adding a provider = new class implementing the interface in `providers/types.ts` + a `case` in the relevant `build*Provider()` switch.

### Media upload flow

This is the most complex subsystem. Large media uses **S3-style multipart uploads** driven from the browser:

- `src/modules/upload/` owns the generic session machinery. `upload.media.registry.ts` maps a `MultipartMediaType` (`video` | `short` | `post`) to a `MultipartMediaAdapter` that knows how to create/find/mark/delete the placeholder DB record for that domain via its repository. **To make a new media type uploadable, add an adapter here** rather than duplicating session logic.
- Session lifecycle: `initiate` (validates mime/size against the adapter, creates a placeholder + provider multipart upload, stores an `IMultipartUploadSession`) → client presigns & uploads parts → `complete` → `ingestFromStorage` hands the stored object to the video/image provider for processing.
- Async processing completes via provider **webhooks** → `webhook` module / `*.webhook.service.ts` update placeholder status (`PROCESSING` → ready). The client learns of completion over **Socket.io** (authenticated by JWT in the handshake; uses the Redis adapter for multi-instance fan-out).
- Small post images go through `multer` (`upload.middleware.ts`) on the `POST /post` route instead of multipart.

Client side mirrors this in `features/upload/`: `useMediaUploadWizard` orchestrates a stepper; `useChunkedMediaUpload` does the part uploads; `uploadPersistence.ts` + `fingerprint.ts` + `useUploadResumePointer` support **resuming** an interrupted upload across reloads.

### Client state & data fetching

- Redux store (`store/store.ts`, `rootReducer.ts`) combines slice reducers (`auth`, `ui`, `video`, `short`, `upload`) with one **RTK Query API per domain** (`authApi`, `videoApi`, `shortApi`, `postApi`, `creatorApi`, `uploadApi`). Each api's `reducer` and `middleware` must be registered in both files when you add one.
- All RTK Query apis use a shared `axiosBaseQuery` (`shared/lib/axiosBaseQuery.ts`) over a configured `axiosInstance` — a 401 response auto-dispatches `clearCredentials()`. Base URLs are per-api (e.g. `postApi` → `/post`), and `axiosInstance` handles the `/api/v1` prefix + CSRF token.
- Feed queries use RTK Query `merge`/`serializeQueryArgs`/`forceRefetch` for infinite-scroll pagination (see `postApi.getFeed`) — page 1 replaces the cache, later pages append de-duplicated by `id`.
- Features live under `src/features/<domain>/` with `components/`, `hooks/`, `pages/`, and `<domain>Api.ts` / `<domain>Slice.ts`. Shared/cross-feature UI and utilities live in `src/shared/`.
- SSR: `entry-server.tsx` / `entry-client.tsx`; routing in `routes/AppRoutes.tsx` with `GuestRoute` / `ProtectedRoute` guards.

### Shared package

`@network/shared` is the single source of truth for the client/server contract. Its `index.ts` barrel re-exports everything. When you add or change an API shape, edit the Zod schema in `schemas/` (used for server validation **and** inferred client types) plus the matching `types/` and `constants/` — do not redefine these shapes locally in client or server.

### Env config

Server env is validated at boot by `src/env/env.ts`, which merges per-domain Zod schemas (`app`, `db`, `redis`, `auth`, `email`, `storage`, `video`) and applies cross-field rules in `validators.ts`. **Invalid env exits the process (code 1) with a treeified error.** Add new env vars to the appropriate `*.env.ts` schema, not ad-hoc `process.env` reads. Provider selection (`STORAGE_PROVIDER`, `VIDEO_PROVIDER`, `IMAGE_PROVIDER`) plus provider credentials are the primary configuration surface.

### Background jobs

Email is queued through **BullMQ** (`src/email/`): `queue.ts` enqueues (`queueOtpEmail`, etc.), `worker.ts` (`startEmailWorker`, started in `server.ts`) processes jobs and sends via nodemailer/Resend. Redis (`ioredis`) backs BullMQ, the Socket.io adapter, and rate limiting.

## TypeScript conventions

The server tsconfig is strict beyond the defaults: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`. Consequences to expect:

- Index/optional access is `T | undefined` — narrow before use.
- `verbatimModuleSyntax` requires `import type { ... }` for type-only imports.
- ESM everywhere (`"type": "module"`); **relative imports must include the `.js` extension** even in `.ts` source (e.g. `import { env } from './env/env.js'`).
