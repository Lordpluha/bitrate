import { AdminAuth, RequirePermission } from '@modules/admin-auth'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminGenresService } from './admin-genres.service'
import {
  CreateGenreSwagger,
  DeleteGenreSwagger,
  GetGenreSwagger,
  ListGenresSwagger,
  UpdateGenreSwagger,
} from './decorators'
import {
  type CreateGenreDto,
  CreateGenreSchema,
  type ListAdminGenresQueryDto,
  ListAdminGenresQuerySchema,
  type UpdateGenreDto,
  UpdateGenreSchema,
} from './dtos'

/** Operator-facing genre management. */
@ApiTags('Admin Genres')
@AdminAuth()
@Controller({ path: 'admin/genres', version: '1' })
export class AdminGenresController {
  constructor(private readonly genres: AdminGenresService) {}

  /** Runs the list genres operation. */
  @RequirePermission('genres:read')
  @ListGenresSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminGenresQuerySchema)) query: ListAdminGenresQueryDto) {
    return this.genres.findAll(query)
  }

  /** Runs the get genre operation. */
  @RequirePermission('genres:read')
  @GetGenreSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.genres.findById(id)
  }

  /** Runs the create genre operation. */
  @RequirePermission('genres:write')
  @CreateGenreSwagger()
  @Post('')
  create(@Body(new ZodValidationPipe(CreateGenreSchema)) dto: CreateGenreDto) {
    return this.genres.create(dto)
  }

  /** Runs the update genre operation. */
  @RequirePermission('genres:write')
  @UpdateGenreSwagger()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateGenreSchema)) dto: UpdateGenreDto,
  ) {
    return this.genres.update(id, dto)
  }

  /** Runs the delete genre operation. Refused with 409 while the genre is referenced. */
  @RequirePermission('genres:delete')
  @DeleteGenreSwagger()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.genres.remove(id)
  }
}
