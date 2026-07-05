---
name: api-rules
description: NestJS API quick reference for apps/api — module anatomy, the decorators/ Swagger rule, nestjs-zod DTOs, Prisma injection, BullMQ queues, guards, and HttpException error handling. Use whenever writing or reviewing a controller, service, module, guard, DTO, or Swagger decorator under apps/api/, or whenever asked to add an endpoint, queue job, or auth guard to the API.
metadata:
  type: reference
  author: lordpluha
---

# API rules — NestJS

Quick reference for `apps/api/`. Read `project-conventions` first for the cross-cutting picture; this file goes one level deeper on the API specifically.

## Module anatomy

```
apps/api/src/modules/<name>/
  <name>.module.ts      @Module decorator
  <name>.controller.ts  HTTP endpoints — thin, delegates to service
  <name>.service.ts     Business logic
  <name>.guard.ts       Auth guard (if needed)
  decorators/           Swagger composite decorators — one file per operation
  dtos/                 Input DTOs with Zod schemas (nestjs-zod)
  entities/             Domain entity classes (@ApiProperty annotated)
  errors/               Custom HttpException subclasses
  __tests__/            Fixtures and builders
  index.ts              Public barrel
```

**CRITICAL:** Never put `@ApiOperation`, `@ApiResponse`, `@ApiBody` inline in controller methods — always extract to `decorators/`. This is the single most-checked rule in review; get it right the first time.

## Swagger decorator pattern

```ts
// decorators/get-track-by-id.swagger.ts
import { ApiOperation, ApiParam, ApiResponse, applyDecorators } from '@nestjs/swagger'
import { TrackEntity } from '../entities'

export const GetTrackByIdSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get track by ID' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: 200, type: TrackEntity }),
    ApiResponse({ status: 404, description: 'Track not found' }),
  )

// in controller:
@GetTrackByIdSwagger()
@Get(':id')
getById(@Param('id', ParseUUIDPipe) id: string) {
  return this.tracksService.findById(id)
}
```

## DTOs with nestjs-zod

```ts
// dtos/create-track.dto.ts
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateTrackSchema = z.object({
  title: z.string().min(1).max(255),
  duration: z.number().int().positive(),
})

export class CreateTrackDto extends createZodDto(CreateTrackSchema) {}
```

## Prisma

Inject `PrismaService` from `@infra/prisma/prisma.service`. Use inside services only — never in controllers.

## BullMQ

Jobs live in `apps/api/src/infra/queues/<queue-name>/`. Processor (`@Processor`) + producer service. Registered in `InfraModule`.

## Guards

```ts
@Injectable()
export class UserAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean { ... }
}
```

## Errors

Throw NestJS built-ins (`NotFoundException`, `UnauthorizedException`, `ConflictException`, `BadRequestException`). Let the global filter handle serialisation — never return a manual `{ error: ... }` object.

## Path aliases (apps/api)

- `@modules/*` → `src/modules/*`
- `@infra/*` → `src/infra/*`
- `@common/*` → `src/common/*`
- `@test/*` → `test/*`

## Related rules and skills

- `jest-rules` — unit/integration/E2E test patterns for this same module structure.
- `project-conventions` — the cross-cutting rules this file specializes.
