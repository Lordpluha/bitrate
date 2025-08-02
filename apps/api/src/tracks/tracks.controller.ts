import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger'
import { TrackEntity } from './entities'
import { TracksService } from './tracks.service'
import { PostTrackSwagger, TracksGetAllSwagger } from './decorators'
import { AuthGuard } from 'src/auth/auth.guard'
import { CreateTrackDto, CreateTrackSchema } from './dtos/create-track.dto'
import { ZodValidationPipe } from 'nestjs-zod'
import { JWTPayload } from 'src/auth/types'

@ApiExtraModels(TrackEntity)
@ApiTags('Tracks')
@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @TracksGetAllSwagger()
  @Get('')
  getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
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
  getById(@Param('id') id: TrackEntity['id']) {
    return this.tracksService.findTrackById(id)
  }

  @PostTrackSwagger()
  @ApiCookieAuth(process.env.ACCESS_TOKEN_NAME)
  @UseGuards(AuthGuard)
  @Post('')
  postTrack(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto
  ) {
    const jwtUser = req['user'] as JWTPayload
    return this.tracksService.create(jwtUser.sub, createTrackDto)
  }

  @ApiOperation({ summary: 'Update track by id' })
  @ApiCookieAuth(process.env.ACCESS_TOKEN_NAME)
  @UseGuards(AuthGuard)
  @Put(':id')
  putTrack(
    @Param('id') id: TrackEntity['id'],
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto
  ) {
    return this.tracksService.update(id, createTrackDto)
  }
}
