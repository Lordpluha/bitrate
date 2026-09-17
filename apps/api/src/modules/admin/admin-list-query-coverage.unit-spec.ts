import { describe, expect, it, jest } from '@jest/globals'
import { AdminArtistsController } from '@modules/admin/artists/admin-artists.controller'
import { ListAdminArtistsQuerySchema } from '@modules/admin/artists/dtos'
import { AdminAuditController } from '@modules/admin/audit/admin-audit.controller'
import { ListAdminAuditLogsQuerySchema } from '@modules/admin/audit/dtos'
import { AdminModerationController } from '@modules/admin/moderation/admin-moderation.controller'
import { ListReportsQuerySchema } from '@modules/admin/moderation/dtos'
import { AdminTracksController } from '@modules/admin/tracks/admin-tracks.controller'
import {
  ListAdminTracksQuerySchema,
  ListProcessingAttemptsQuerySchema,
} from '@modules/admin/tracks/dtos'
import { AdminUsersController } from '@modules/admin/users/admin-users.controller'
import { ListAdminUsersQuerySchema } from '@modules/admin/users/dtos'
import type { Type } from '@nestjs/common'
import type { ZodType } from 'zod'

/**
 * `@nestjs/swagger`'s `DECORATORS.API_PARAMETERS` metadata key, copied rather than imported —
 * the package's `exports` map only publishes `.` and `./plugin`, so `dist/constants` isn't a
 * resolvable subpath. The value comes straight from `@nestjs/swagger`'s own source
 * (`DECORATORS_PREFIX = 'swagger'`, `API_PARAMETERS: '${DECORATORS_PREFIX}/apiParameters'`)
 * and is what every `ApiQuery`/`ApiParam`/`ApiHeader` decorator writes its metadata under.
 */
const API_PARAMETERS_METADATA_KEY = 'swagger/apiParameters'

/** `TrackUploadService` pulls in `music-metadata` via `track-media.ts`; that package cannot
 * be resolved under Jest, so every spec that reaches it mocks it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

type SwaggerQueryParameter = { in?: string; name?: string }

type ListRouteCase = {
  name: string
  controller: Type
  handlerName: string
  schema: ZodType
}

/**
 * Every admin list route, paired with the zod query schema its DTO validates against.
 * Adding a filter to a schema without adding its `@ApiQuery` (or vice versa) fails this spec
 * — see the ApiBody lesson in `api-rules.md` this generalises to query params.
 */
const LIST_ROUTES: ListRouteCase[] = [
  {
    name: 'AdminTracksController.list',
    controller: AdminTracksController,
    handlerName: 'list',
    schema: ListAdminTracksQuerySchema,
  },
  {
    name: 'AdminUsersController.list',
    controller: AdminUsersController,
    handlerName: 'list',
    schema: ListAdminUsersQuerySchema,
  },
  {
    name: 'AdminArtistsController.list',
    controller: AdminArtistsController,
    handlerName: 'list',
    schema: ListAdminArtistsQuerySchema,
  },
  {
    name: 'AdminModerationController.list',
    controller: AdminModerationController,
    handlerName: 'list',
    schema: ListReportsQuerySchema,
  },
  {
    name: 'AdminAuditController.list',
    controller: AdminAuditController,
    handlerName: 'list',
    schema: ListAdminAuditLogsQuerySchema,
  },
  {
    name: 'AdminTracksController.listProcessingAttempts',
    controller: AdminTracksController,
    handlerName: 'listProcessingAttempts',
    schema: ListProcessingAttemptsQuerySchema,
  },
]

function declaredQueryNames(controller: Type, handlerName: string): string[] {
  const prototype = controller.prototype as Record<string, (...args: never[]) => unknown>
  const handler = prototype[handlerName]
  if (!handler) throw new Error(`No handler named "${handlerName}" on ${controller.name}`)
  const parameters: SwaggerQueryParameter[] =
    Reflect.getMetadata(API_PARAMETERS_METADATA_KEY, handler) ?? []

  return parameters
    .filter((parameter) => parameter.in === 'query')
    .map((parameter) => parameter.name)
    .filter((name): name is string => typeof name === 'string' && name.length > 0)
    .sort()
}

/** Reads a zod object's own key set — every schema here is a `ZodObject`, optionally wrapped
 * in `.refine()`, whose `.shape` survives the wrap. */
function schemaKeys(schema: ZodType): string[] {
  const shaped = schema as unknown as { shape?: Record<string, unknown> }
  if (!shaped.shape) throw new Error('Expected a zod object schema with a .shape')
  return Object.keys(shaped.shape).sort()
}

describe('admin list route query coverage', () => {
  it.each(LIST_ROUTES)('$name declares an ApiQuery for every DTO field', (route) => {
    const declared = declaredQueryNames(route.controller, route.handlerName)
    const expected = schemaKeys(route.schema)

    expect(declared).toEqual(expected)
  })
})
