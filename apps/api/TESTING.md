
# Testing organization

This document describes how tests are organized in the API app and how to run them.

## Test layers

### Unit tests (module-level, mocked)
- **Purpose:** Validate isolated logic with mocks only (no DB, no external services).
- **Location:** src/modules/**/**.spec.ts
- **Runner:** default Jest config in [apps/api/package.json](package.json)

### Integration tests (real DB, module-local)

- **Purpose:** Test a module with real Prisma + DB. Cross‑module wiring is allowed, but the test file lives next to the module.
- **Location:** src/modules/**/__tests__/integration/*.int-spec.ts
- **Runner config:** [apps/api/test/jest-integration.json](test/jest-integration.json)

### E2E tests (user scenarios)
- **Purpose:** User‑facing flows over HTTP (public routes, auth flows, happy paths).
- **Location:** test/e2e/**/*.e2e-spec.ts
- **Config:** [apps/api/test/jest-e2e.json](test/jest-e2e.json)

## Naming conventions

- Unit: *.spec.ts
- Integration: *.int-spec.ts
- E2E: *.e2e-spec.ts

## How to run

- Unit: pnpm test
- Integration: pnpm test:integration
- E2E: pnpm test:e2e

Scripts live in [apps/api/package.json](package.json).

## Environment requirements

Integration and E2E tests require real infrastructure:

- **PostgreSQL** via DATABASE_URL
- **Redis** via REDIS_HOST / REDIS_PORT
- **JWT/Cookies config** for auth guards:
	- JWT_SECRET
	- JWT_ACCESS_EXPIRES_IN
	- JWT_REFRESH_EXPIRES_IN
	- ACCESS_TOKEN_NAME
	- REFRESH_TOKEN_NAME
- **Other required envs:** WEB_HOST, NODE_ENV
- **E2E base URL (external API):** E2E_BASE_URL (optional; defaults to http://localhost:${PORT})

All required variables are validated in [apps/api/env.schema.ts](env.schema.ts).

## Guidelines

- Unit tests must mock Prisma and external services.
- Integration tests should clean up DB state in beforeEach/afterEach.
- E2E tests should focus on user scenarios and avoid direct DB assertions when possible.

## Fixtures

Shared test data lives in test/fixtures and should be reused across integration/e2e tests to keep IDs and base entities consistent.


| Test level   | app runtime          | DB       |
|--------------|----------------------|----------|
| Unit         | mocked               | mocked   |
| Integration  | in-process (Nest app) | test DB  |
| E2E          | external API          | test DB  |

Short definitions:
- Unit: isolated controller/service logic with mocks only.
- Integration: full controller + service + Prisma + DB, but in-process HTTP.
- E2E: user flows against a separately running API (real network, test infra).