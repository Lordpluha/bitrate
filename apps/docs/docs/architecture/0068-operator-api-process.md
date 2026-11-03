# ADR-0068: The operator API as its own process, contract and host

Status: Accepted

Date: 2026-11-03

Tracked in [#458](https://github.com/Lordpluha/bitrate/issues/458).

## Context

The operator ("admin") surface already had its own module tree (`modules/admin/*`), identity
(Staff with permission RBAC, [ADR-0036](./0036-admin-clean-architecture.md)) and cookies. It still
ran inside the public API process on `api.<domain>`, was described by the one OpenAPI document,
and so reached web-player and web-artists as types in the shared `v1.ts` contract. Staff session
cookies were scoped to the shared `COOKIE_DOMAIN` and travelled to every subdomain.

## Decision

**A second entry point.** `main.admin.ts` boots `AdminAppModule` — the shared root wiring
(`AppCoreModule`: config, logging, i18n, Sentry, throttler, BullMQ connection, Prisma, cache,
metrics, the health/metrics `AppController`, global guard/interceptors/filter/middleware) plus
`AdminModule`. `main.ts` boots `AppModule`, which no longer imports `AdminModule`. Both share
`bootstrapHttp()`; each has its own port (`PORT`, `ADMIN_API_PORT` = 3007), CORS origins and
OpenAPI document. The same image runs both, like the transcode worker
([ADR-0049](./0049-transcode-worker-process-boundary.md)).

**Service-only core modules.** Nest registers the controllers of every imported module, so the
admin graph must not reach a module with listener/artist routes or a queue consumer.
`TracksCoreModule`, `AlbumsCoreModule`, `ReleasePublishingCoreModule` and
`AudioProcessingQueueModule` hold the services and queue producers; the public modules add their
controllers and consumers on top. `app-surfaces.unit-spec.ts` walks both module graphs and fails
if the operator process registers a non-operator controller or any `@Processor`, or the public
process registers an operator route.

**Two contracts.** Each process serves its own Swagger document. `@bitrate/contracts` generates
`v1.ts` (public) and `admin-v1.ts` (operator); the admin panel imports `@bitrate/contracts/admin`,
which the package root does not re-export. CI regenerates and diffs both.

**Same origin as the panel.** In production nginx forwards `/api/v1/admin/` and
`/api/v1/health/` on `admin.<domain>` to `admin-api`; everything else there is the SPA, so the
operator Swagger is not published. `api.<domain>` answers 404 for operator paths. Staff sign-in
and refresh get a stricter `limit_req` zone. Network restriction stops at host isolation: no IP
allowlist, VPN or basic auth.

**Host-only staff sessions.** Staff cookies are written without `COOKIE_DOMAIN`, so only the
operator host receives them. Sign-in, refresh and sign-out also clear staff cookies a session from
before this change left on the parent domain; that clearing goes once those sessions have
expired. Listener and artist cookies are unchanged.

**Operations.** `admin-api` is a compose service in production and preprod with its own
healthcheck, Prometheus job (`bitrate-admin-api`), deploy health-gate probe and external monitor.
It consumes no queue. Locally `pnpm dev` runs both processes; the operator one builds into
`dist-admin` because two watchers sharing `dist` would delete each other's output.

## Consequences

- The release that ships this signs staff out once; there is no period with operator routes on
  both hosts. Rollback is the previous image tag, which carries the previous nginx templates too.
- A failing `admin-api` now fails the deploy gate.
- A new admin module must import core modules, not the public ones; the surface spec enforces it.
- Admin areas still write some tables directly; reducing that baseline is
  [ADR-0060](./0060-api-data-write-ownership.md)'s track, unaffected by this split.

## Alternatives considered

- **Separate swagger documents only** — hides the operator schema but keeps operators and
  listeners in one process, on one host, with one cookie scope.
- **A separate `apps/admin-api` application with the domain in shared libraries** — the strongest
  isolation, but it needs the domain services moved out of `apps/api` first, for little over a
  second entry point in the same codebase.
- **A middleware answering 404 outside `/api/v1/admin` in the operator process** — the public
  controllers and consumers would still be instantiated there.
