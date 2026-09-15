---
name: jest
description: Jest testing conventions for apps/api — unit specs with jest-mock-extended, integration specs with NestJS TestingModule + supertest, E2E specs against real Postgres/Redis, fixture builders, and guard overrides. Use whenever writing or reviewing a *.unit-spec.ts, *.int-spec.ts, or *.e2e-spec.ts file, or whenever asked to "write a test for" a NestJS controller/service.
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# Jest rules — apps/api

Testing conventions for `apps/api/`. Three layers, all using Jest.

## Test layers

| Kind | Suffix | Location | Infra needed |
|------|--------|----------|--------------|
| Unit | `*.unit-spec.ts` (legacy `*.spec.ts`) | Co-located with the module | None — `prismaMock` |
| Integration | `*.int-spec.ts` | Co-located with the module | None — `prismaMock` replaces Prisma |
| E2E | `*.e2e-spec.ts` | `test/e2e/**/*.e2e-spec.ts` | Real PostgreSQL + Redis |

See `apps/api/TESTING.md` for the authoritative layer definitions.

## Jest globals import

Always import explicitly — no implicit globals:

```ts
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
```

## Unit spec pattern

Uses `jest-mock-extended` for deep mocks:

```ts
import { beforeEach, describe, expect, it } from '@jest/globals'
import { mockDeep, mockReset, type DeepMockProxy } from 'jest-mock-extended'
import type { TracksService } from './tracks.service'
import { TracksController } from './tracks.controller'

describe('TracksController', () => {
  let controller: TracksController
  let service: DeepMockProxy<TracksService>

  beforeEach(() => {
    service = mockDeep<TracksService>()
    mockReset(service)
    controller = new TracksController(service)
  })

  it('should return tracks list', async () => {
    service.findAll.mockResolvedValue([])
    const result = await controller.getAll()
    expect(result).toEqual([])
  })
})
```

## Integration spec pattern

Uses `@nestjs/testing` + `supertest`. Mocks services via `useValue`:

```ts
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Test, type TestingModule } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'

describe('TracksController (int)', () => {
  let app: INestApplication
  let service: jest.Mocked<TracksService>

  beforeAll(async () => {
    service = { findAll: jest.fn(), findById: jest.fn() } as unknown as jest.Mocked<TracksService>

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [{ provide: TracksService, useValue: service }],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => {
    service.findAll.mockReset()
  })

  it('GET /tracks should return 200', async () => {
    service.findAll.mockResolvedValue([])
    await request(app.getHttpServer()).get('/tracks').expect(200)
  })
})
```

## Guard override in integration tests

```ts
const module = await Test.createTestingModule({ ... })
  .overrideGuard(UserAuthGuard)
  .useValue({
    canActivate: (ctx) => {
      ctx.switchToHttp().getRequest().user = buildUser()
      return true
    },
  })
  .compile()
```

## Fixtures

Place in `__tests__/fixtures/` inside the module. Builder pattern:

```ts
// __tests__/fixtures/tracks.fixtures.ts
export const buildTrack = (overrides?: Partial<TrackEntity>): TrackEntity => ({
  id: 'uuid-1',
  title: 'Test Track',
  duration: 180,
  ...overrides,
})
```

## E2E spec pattern

Uses `createE2eApp()` helper from `test/helpers/`. Real DB required:

```ts
import { createE2eApp } from '../../helpers/create-e2e-app'

describe('Tracks (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    ;({ app } = await createE2eApp())
  })

  afterAll(() => app.close())

  it('POST /tracks should return 201', async () => {
    await request(app.getHttpServer()).post('/tracks').send({...}).expect(201)
  })
})
```

## Smoke-run a single spec

```bash
# Run one unit spec
pnpm --filter @bitrate/api test -- --testPathPattern users-auth.controller.unit-spec

# Run one integration spec
pnpm --filter @bitrate/api test:int -- --testPathPattern tracks.controller.int-spec

# Run with coverage
pnpm --filter @bitrate/api test:cov
```

## Module-level mocks

For modules that use side effects at import time (e.g. `otplib`, `qrcode`), mock before the import:

```ts
jest.mock('otplib', () => ({ generateSecret: jest.fn() }))
jest.mock('qrcode', () => ({ toDataURL: jest.fn() }))

// then import the module under test
import { TwoFactorService } from './two-factor.service'
```

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/jest` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('jest/package.json').version"
   ```
2. **Then the official docs:** https://jestjs.io/docs/getting-started — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because this repo uses ESM-style `@jest/globals` imports, unlike most examples.

## Related rules and skills

- `api-rules` — the module structure these specs test against.
- `br-tester` — the heavy specialist that writes/runs one focused spec end to end
  and smoke-runs it; dispatched by `/br-implement` by default, or invoke it directly via the
  Agent tool. Prefer this skill when you just need the conventions to review or hand-write a
  spec yourself in-session (`--session`).
