# Testing organization

This document describes how tests are organized in the API app and how to run them.

## Test layers

### Unit tests (module-level, mocked)
- **Purpose:** Validate isolated logic with mocks only (no DB, no external services).
- **Location:** Next to the source file they test (e.g. `albums.service.unit-spec.ts` beside `albums.service.ts`). Legacy files use `*.spec.ts`.
- **Runner:** `pnpm test` (uses `jest-unit.json`, matches `*.unit-spec.ts` and `*.spec.ts`)

### Integration tests (mocked Prisma, NestJS DI)

- **Purpose:** Test NestJS DI wiring, HTTP routing, pipes and guard overrides. Prisma is replaced by `prismaMock` — no real DB required.
- **Location:** Next to the source file they test (e.g. `albums.controller.int-spec.ts`).
- **Runner config:** [apps/api/test/jest-int.json](test/jest-int.json)
- **Runner:** `pnpm test:int`

### E2E tests (user scenarios, real DB)
- **Purpose:** User-facing flows over HTTP (register, login, CRUD, auth scenarios) against a real PostgreSQL + Redis test environment.
- **Location:** `test/e2e/**/*.e2e-spec.ts`
- **Config:** [apps/api/test/jest-e2e.json](test/jest-e2e.json)
- **Runner:** `pnpm test:e2e`

## Naming conventions

- Unit: `*.unit-spec.ts` (preferred) or `*.spec.ts` (legacy)
- Integration: `*.int-spec.ts`
- E2E: `*.e2e-spec.ts`

## How to run

- Unit: `pnpm test`
- Integration: `pnpm test:int`
- E2E: `pnpm test:e2e`

Scripts live in [apps/api/package.json](package.json).

## Environment requirements

Only E2E tests require real infrastructure:

- **PostgreSQL** via `DATABASE_URL`
- **Redis** via `REDIS_HOST` / `REDIS_PORT`
- **JWT/Cookies config** for auth guards:
  - `JWT_SECRET`
  - `JWT_ACCESS_EXPIRES_IN`
  - `JWT_REFRESH_EXPIRES_IN`
  - `ACCESS_TOKEN_NAME`
  - `REFRESH_TOKEN_NAME`
- **Other required envs:** `WEB_HOST`, `NODE_ENV`

All required variables are validated in [apps/api/env.schema.ts](env.schema.ts).

Unit and integration tests use `prismaMock` (jest-mock-extended) and require no running infrastructure.

## Fixtures

- Module-local fixtures live in `src/modules/<module>/__tests__/fixtures/`
- Shared E2E fixtures and helpers live in `test/fixtures/` and `test/helpers/`

## Test patterns

### Unit test (direct class instantiation)

```typescript
service = new AlbumsService(prismaMock)
```

### Integration test (NestJS container, mocked providers)

```typescript
const module = await Test.createTestingModule({
  controllers: [AlbumsController],
  providers: [{ provide: AlbumsService, useValue: serviceMock }],
})
  .overrideGuard(ArtistAuthGuard)
  .useValue({ canActivate: () => true })
  .compile()
```

### E2E test (full app, real DB)

```typescript
const { app, prisma } = await createE2eApp()
await request(app.getHttpServer()).post('/albums').send({...}).expect(201)
```

## Test layer summary

| Test level   | App runtime            | DB         | Guard override |
|--------------|------------------------|------------|----------------|
| Unit         | Class instantiation    | prismaMock | N/A            |
| Integration  | NestJS TestingModule   | prismaMock | overrideGuard  |
| E2E          | Full NestJS app        | Real DB    | None (real)    |
