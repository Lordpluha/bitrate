import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req
} from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { TrackEntity } from './entities'
import { TracksService } from './tracks.service'
import { PostTrackSwagger, TracksGetAllSwagger } from './decorators'
import { Auth } from 'src/auth/auth.guard'
import { CreateTrackDto, CreateTrackSchema } from './dtos/create-track.dto'
import { ZodValidationPipe } from 'nestjs-zod'
import { UserEntity } from 'src/users/entities'

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
    @Query('title') title?: TrackEntity['title']
  ) {
    return this.tracksService.findAll({
      limit,
      page,
      title
    })
  }

  @ApiOperation({ summary: 'Get track by id' })
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.findTrackById(id)
  }

  @PostTrackSwagger()
  @Auth()
  @Post('')
  postTrack(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto
  ) {
    const user = req['user'] as UserEntity
    return this.tracksService.create(user.id, createTrackDto)
  }

  @ApiOperation({ summary: 'Update track by id' })
  @Auth()
  @Put(':id')
  putTrack(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto
  ) {
    return this.tracksService.update(id, createTrackDto)
  }
}
