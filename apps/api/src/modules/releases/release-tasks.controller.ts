import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  CreateReleaseTaskSwagger,
  DeleteReleaseTaskSwagger,
  ListArtistTasksSwagger,
  ListReleaseTasksSwagger,
  UpdateReleaseTaskSwagger,
} from './decorators'
import {
  type CreateReleaseTaskDto,
  CreateReleaseTaskSchema,
  type DeleteReleaseTaskDto,
  DeleteReleaseTaskSchema,
  type ListArtistTasksDto,
  ListArtistTasksSchema,
  type UpdateReleaseTaskDto,
  UpdateReleaseTaskSchema,
} from './dtos/release-task.dto'
import { ReleaseTasksService } from './release-tasks.service'

@ApiTags('Releases')
@Controller({ path: 'releases', version: '1' })
export class ReleaseTasksController {
  constructor(private readonly tasks: ReleaseTasksService) {}

  @ListReleaseTasksSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id/tasks')
  list(@Req() request: ArtistAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.list(request.artist.id, id)
  }

  @CreateReleaseTaskSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Post(':id/tasks')
  create(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CreateReleaseTaskSchema)) input: CreateReleaseTaskDto,
  ) {
    return this.tasks.create(request.artist.id, id, input)
  }

  @UpdateReleaseTaskSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch(':id/tasks/:taskId')
  update(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body(new ZodValidationPipe(UpdateReleaseTaskSchema)) input: UpdateReleaseTaskDto,
  ) {
    return this.tasks.update(request.artist.id, id, taskId, input)
  }

  @DeleteReleaseTaskSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Delete(':id/tasks/:taskId')
  remove(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body(new ZodValidationPipe(DeleteReleaseTaskSchema)) input: DeleteReleaseTaskDto,
  ) {
    return this.tasks.remove(request.artist.id, id, taskId, input)
  }
}

/** The artist-wide task list behind the dashboard's Tasks page. */
@ApiTags('Releases')
@Controller({ path: 'release-tasks', version: '1' })
export class ArtistTasksController {
  constructor(private readonly tasks: ReleaseTasksService) {}

  @ListArtistTasksSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  list(
    @Req() request: ArtistAuthRequest,
    @Query(new ZodValidationPipe(ListArtistTasksSchema)) query: ListArtistTasksDto,
  ) {
    return this.tasks.listForArtist(request.artist.id, query)
  }
}
