# NestJS API conventions

Working reference for `apps/api/src/`. Read before adding a module, endpoint, service, or test. See also `.claude/rules/api-rules.md` for a quick summary.

## Module structure

```
apps/api/src/modules/<name>/
  <name>.module.ts      @Module — imports, controllers, providers, exports
  <name>.controller.ts  HTTP endpoints — thin, only input parsing + delegation
  <name>.service.ts     Business logic (split into multiple services when large)
  <name>.guard.ts       Auth guard (CanActivate)
  decorators/           Swagger composite decorators — one file per operation
  dtos/                 Input DTOs with Zod schemas (nestjs-zod)
  entities/             Domain entity classes (@ApiProperty annotated)
  errors/               Custom HttpException subclasses
  __tests__/            Fixtures and builders
  index.ts              Public barrel
```

## Controllers — thin by design

Controllers parse input and call services. Zero business logic, zero Prisma, zero direct DB access.

```ts
@ApiExtraModels(TrackEntity)
@ApiTags('Tracks')
@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @TracksGetAllSwagger()
  @Get('')
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('title') title?: string,
  ) {
    return this.tracksService.findAll({ page, limit, title })
  }
}
```

## Swagger decorators — required in `decorators/`

**Rule**: every controller operation must have its Swagger metadata in `decorators/` — never inline.

```ts
// decorators/tracks-get-all.swagger.ts
import { ApiOperation, ApiQuery, ApiResponse, applyDecorators } from '@nestjs/swagger'
import { TrackEntity } from '../entities'

export const TracksGetAllSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all tracks' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'title', required: false, type: String }),
    ApiResponse({ status: 200, type: [TrackEntity] }),
  )
```

Re-export all from `decorators/index.ts`. Import in the controller via `import { TracksGetAllSwagger } from './decorators'`.

## DTOs with nestjs-zod

```ts
// dtos/create-track.dto.ts
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateTrackSchema = z.object({
  title: z.string().min(1).max(255),
  duration: z.number().int().positive(),
  artistId: z.string().uuid(),
})

export class CreateTrackDto extends createZodDto(CreateTrackSchema) {}
```

The `CreateTrackDto` class is used for controller `@Body()` typing. Apply `new ZodValidationPipe(CreateTrackSchema)` at handler level or via the global pipe in `main.ts`.

## Entities (Swagger + return types)

```ts
// entities/track.entity.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class TrackEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiPropertyOptional()
  coverUrl?: string | null
}
```

Entity classes are not Prisma models — they describe the API response shape for Swagger and can be used as return type hints.

## Services

`@Injectable()` classes. Constructor injection only. Split by concern when a module grows large:

```ts
@Injectable()
export class TracksService {
  constructor(
    private prisma: PrismaService,
    private converter: ConverterService,
  ) {}

  async findAll({ page = 1, limit = 20, title }: FindAllTracksInput) {
    return this.prisma.track.findMany({
      where: title ? { title: { contains: title, mode: 'insensitive' } } : undefined,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
  }
}
```

## Guards

```ts
// users-auth.guard.ts
@Injectable()
export class UserAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<UserAuthRequest>()
    // validate JWT from cookie, attach user to req.user
    return !!req.user
  }
}
```

Apply on controller class or individual routes. Common pattern: wrap in a decorator:

```ts
// in controller file
@UserAuth()   // custom decorator wrapping @UseGuards(UserAuthGuard)
@Get('me')
getMe(@Req() req: UserAuthRequest) {
  return req.user
}
```

## Error handling

Throw NestJS HTTP exceptions — the global filter serialises them:

```ts
// Built-ins
throw new NotFoundException(`Track ${id} not found`)
throw new UnauthorizedException('Invalid credentials')
throw new ConflictException('Track with this title already exists')
throw new BadRequestException('Invalid file format')

// Custom exception in errors/
export class TrackNotFoundException extends NotFoundException {
  constructor(id: string) { super(`Track ${id} not found`) }
}
```

Never return error response objects manually from a service or controller.

## Prisma patterns

```ts
// Service
async findById(id: string) {
  const track = await this.prisma.track.findFirst({ where: { id } })
  if (!track) throw new TrackNotFoundException(id)
  return track
}

// Pagination
async findAll({ page, limit }: PaginationInput) {
  const [data, total] = await Promise.all([
    this.prisma.track.findMany({ skip: (page - 1) * limit, take: limit }),
    this.prisma.track.count(),
  ])
  return { data, total, page, limit }
}
```

Always inject `PrismaService` from `@infra/prisma/prisma.service`. Never in controllers.

## Path aliases

```ts
import { PrismaService } from '@infra/prisma/prisma.service'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import { buildTrack } from '@test/fixtures/tracks.fixtures'
```

Cross-module imports go through the module's `index.ts` barrel.

## Module registration

Register new modules in `AppModule` (or a parent domain module). Modules are self-contained — declare their own providers and export only what other modules need.

## Testing

See `.claude/rules/jest-rules.md` for detailed patterns. Summary:
- **Unit** (`*.unit-spec.ts`) — `mockDeep<Service>()`, instantiate controller directly.
- **Integration** (`*.int-spec.ts`) — `Test.createTestingModule` + `supertest`, override guards.
- **E2E** (`test/e2e/**/*.e2e-spec.ts`) — full app, real DB.

Run: `pnpm --filter @spotify/api test -- --testPathPattern <filename>`
