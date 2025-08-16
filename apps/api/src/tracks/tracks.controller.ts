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
  Req,
  Res,
  Headers,
  BadRequestException,
  NotFoundException,
  StreamableFile
} from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { TrackEntity } from './entities'
import { TracksService } from './tracks.service'
import {
  PostTrackSwagger,
  TracksGetAllSwagger,
  GetTrackByIdSwagger,
  UpdateTrackByIdSwagger
} from './decorators'
import { Auth } from 'src/auth/auth.guard'
import { CreateTrackDto, CreateTrackSchema } from './dtos/create-track.dto'
import { ZodValidationPipe } from 'nestjs-zod'
import { UserEntity } from 'src/users/entities'
import { AudioGateway } from './audio.gateway'
import * as path from 'path'
import * as fs from 'fs'
import { Response, Request } from 'express'

@ApiExtraModels(TrackEntity)
@ApiTags('Tracks')
@Controller('tracks')
export class TracksController {
  constructor(
    private tracksService: TracksService,
    private audioGateway: AudioGateway
  ) {}

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

  @GetTrackByIdSwagger()
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

  @UpdateTrackByIdSwagger()
  @Auth()
  @Put(':id')
  putTrack(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto
  ) {
    return this.tracksService.update(id, createTrackDto)
  }

  @ApiOperation({ summary: 'Stream audio track' })
  @Auth() // Добавляем аутентификацию для доступа к стримингу
  @Get('stream/:id')
  async streamTrack(
    @Param('id', ParseUUIDPipe) trackId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('range') range?: string
  ) {
    try {
      console.log(`Attempting to stream track: ${trackId}`)

      // Verify track exists
      const track = await this.tracksService.findTrackById(trackId)
      if (!track) {
        throw new NotFoundException('Track not found')
      }

      console.log(`Track found:`, {
        id: track.id,
        title: track.title,
        audioUrl: track.audioUrl,
        audioUrlType: typeof track.audioUrl
      })

      // Check if audioUrl exists
      if (!track.audioUrl) {
        console.error(`Track ${trackId} has no audioUrl`)
        throw new NotFoundException('Track audio file not configured')
      }

      // Build file path - handle both URLs and file paths
      let filePath: string

      if (
        track.audioUrl.startsWith('http://') ||
        track.audioUrl.startsWith('https://')
      ) {
        // It's a URL, extract the file path from it
        try {
          const url = new URL(track.audioUrl)
          // Extract the pathname and join with current working directory
          filePath = path.join(process.cwd(), url.pathname)
        } catch (error) {
          console.error(`Invalid URL in audioUrl: ${track.audioUrl}`, error)
          throw new NotFoundException('Invalid audio URL format')
        }
      } else if (path.isAbsolute(track.audioUrl)) {
        // It's an absolute file path
        filePath = track.audioUrl
      } else {
        // It's a relative path, assume it's relative to uploads/tracks directory
        filePath = path.join(process.cwd(), 'uploads', 'tracks', track.audioUrl)
      }

      console.log(`Constructed file path: ${filePath}`)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Audio file not found: ${filePath}`)
        throw new NotFoundException(`Audio file not found: ${track.audioUrl}`)
      }

      const stat = fs.statSync(filePath)
      const fileSize = stat.size

      // Set CORS headers
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Authorization',
        'Access-Control-Expose-Headers':
          'Content-Range, Accept-Ranges, Content-Length'
      })

      if (range) {
        // Handle range requests for progressive download/streaming
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunksize = end - start + 1

        const file = fs.createReadStream(filePath, { start, end })

        res.status(206)
        res.set({
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'audio/mpeg'
        })

        return new StreamableFile(file)
      } else {
        // Handle normal requests
        res.set({
          'Content-Length': fileSize.toString(),
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes'
        })

        const file = fs.createReadStream(filePath)
        return new StreamableFile(file)
      }
    } catch (error) {
      console.error('Error streaming track:', error)
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new NotFoundException('Error streaming audio file')
    }
  }

  @ApiOperation({ summary: 'Start playing track for authenticated user' })
  @Auth()
  @Post('play/:id')
  async playTrack(
    @Param('id', ParseUUIDPipe) trackId: string,
    @Req() req: Request,
    @Body('currentTime') currentTime: number = 0
  ) {
    const user = req['user'] as UserEntity

    // Verify track exists
    const track = await this.tracksService.findTrackById(trackId)
    if (!track) {
      throw new NotFoundException('Track not found')
    }

    // Emit play event to user's room
    this.audioGateway.emitToUser(user.id, 'trackPlaying', {
      trackId,
      currentTime,
      userId: user.id,
      track: {
        id: track.id,
        title: track.title,
        audioUrl: track.audioUrl,
        cover: track.cover
      }
    })

    return {
      success: true,
      message: 'Track playback started',
      trackId,
      currentTime
    }
  }

  @ApiOperation({ summary: 'Pause track for authenticated user' })
  @Auth()
  @Post('pause/:id')
  async pauseTrack(
    @Param('id', ParseUUIDPipe) trackId: string,
    @Req() req: Request,
    @Body('currentTime') currentTime: number = 0
  ) {
    const user = req['user'] as UserEntity

    // Verify track exists
    const track = await this.tracksService.findTrackById(trackId)
    if (!track) {
      throw new NotFoundException('Track not found')
    }

    // Emit pause event to user's room
    this.audioGateway.emitToUser(user.id, 'trackPaused', {
      trackId,
      currentTime,
      userId: user.id
    })

    return {
      success: true,
      message: 'Track playback paused',
      trackId,
      currentTime
    }
  }

  @ApiOperation({
    summary: 'Update track streaming state for authenticated user'
  })
  @Auth()
  @Post('update-state/:id')
  async updateTrackState(
    @Param('id', ParseUUIDPipe) trackId: string,
    @Req() req: Request,
    @Body() body: { currentTime: number; isPlaying: boolean }
  ) {
    const user = req['user'] as UserEntity

    if (
      typeof body.currentTime !== 'number' ||
      typeof body.isPlaying !== 'boolean'
    ) {
      throw new BadRequestException('Invalid body parameters')
    }

    // Verify track exists
    const track = await this.tracksService.findTrackById(trackId)
    if (!track) {
      throw new NotFoundException('Track not found')
    }

    // Emit update event to user's room
    this.audioGateway.emitToUser(user.id, 'trackUpdated', {
      trackId,
      currentTime: body.currentTime,
      isPlaying: body.isPlaying,
      userId: user.id
    })

    return {
      success: true,
      message: 'Track state updated',
      trackId,
      currentTime: body.currentTime,
      isPlaying: body.isPlaying
    }
  }

  @ApiOperation({ summary: 'Get current track state for authenticated user' })
  @Auth()
  @Get('current-state')
  getCurrentState(@Req() req: Request) {
    const user = req['user'] as UserEntity

    // This would typically be handled by the WebSocket gateway
    // But we can provide a REST endpoint as well
    return {
      message: 'Current state available via WebSocket connection',
      userId: user.id
    }
  }
}
