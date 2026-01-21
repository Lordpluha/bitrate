import { Auth } from '@modules/auth/auth.guard'
import { UserEntity } from '@modules/users'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import * as fs from 'fs'
import { parseFile } from 'music-metadata'
import { ZodValidationPipe } from 'nestjs-zod'
import * as path from 'path'
import { AudioGateway } from './audio.gateway'
import {
  GetTrackByIdSwagger,
  PostTrackSwagger,
  TracksGetAllSwagger,
  TracksGetLikedSwagger,
  UpdateTrackByIdSwagger,
} from './decorators'
import { CreateTrackDto, CreateTrackSchema } from './dtos/create-track.dto'
import { TrackEntity } from './entities'
import { TracksService } from './tracks.service'

@ApiExtraModels(TrackEntity)
@ApiTags('Tracks')
@Controller('tracks')
export class TracksController {
  constructor(
    private tracksService: TracksService,
    private audioGateway: AudioGateway,
  ) {}

  @TracksGetAllSwagger()
  @Get('')
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('title') title?: TrackEntity['title'],
  ) {
    return this.tracksService.findAll({
      limit,
      page,
      title,
    })
  }

  @Auth()
  @TracksGetLikedSwagger()
  @Get('liked')
  getLikedTracks(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const user = req['user'] as UserEntity
    return this.tracksService.findLikedTracks(user.id, {
      page,
      limit,
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
    createTrackDto: CreateTrackDto,
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
    createTrackDto: CreateTrackDto,
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
    @Headers('range') range?: string,
  ) {
    try {
      console.log(`Attempting to stream track: ${trackId}`)

      // Verify track exists
      const track = await this.tracksService.findTrackById(trackId)
      if (!track) {
        throw new NotFoundException('Track not found')
      }

      console.log('Track found:', {
        id: track.id,
        title: track.title,
        audioUrl: track.audioUrl,
        audioUrlType: typeof track.audioUrl,
      })

      // Check if audioUrl exists
      if (!track.audioUrl) {
        console.error(`Track ${trackId} has no audioUrl`)
        throw new NotFoundException('Track audio file not configured')
      }

      // Build file path - handle both URLs and file paths
      let filePath: string

      if (track.audioUrl.startsWith('http://') || track.audioUrl.startsWith('https://')) {
        // It's a URL, extract the file path from it
        try {
          const url = new URL(track.audioUrl)
          // Extract the pathname and join with current working directory
          // Remove leading slash from pathname to properly join with cwd
          const relativePath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
          filePath = path.join(process.cwd(), relativePath)
        } catch (error) {
          console.error(`Invalid URL in audioUrl: ${track.audioUrl}`, error)
          throw new NotFoundException('Invalid audio URL format')
        }
      } else if (path.isAbsolute(track.audioUrl)) {
        // It's an absolute file path
        filePath = track.audioUrl
      } else {
        // It's a relative path, assume it's relative to storage/private/tracks directory
        filePath = path.join(process.cwd(), 'storage', 'private', 'tracks', track.audioUrl)
      }

      console.log(`Constructed file path: ${filePath}`)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Audio file not found: ${filePath}`)
        throw new NotFoundException(`Audio file not found: ${track.audioUrl}`)
      }

      const stat = fs.statSync(filePath)
      const fileSize = stat.size

      // Determine content type based on file extension
      const fileExtension = path.extname(filePath).toLowerCase()
      const contentType =
        fileExtension === '.opus' || fileExtension === '.webm'
          ? 'audio/webm; codecs="opus"'
          : 'audio/mpeg'

      // Read track duration from metadata
      let trackDuration: number | undefined
      try {
        const metadata = await parseFile(filePath)
        trackDuration = metadata.format.duration
        console.log(`Track duration from metadata: ${trackDuration}s`)
      } catch (error) {
        console.warn(`Could not read metadata for ${filePath}:`, error)
      }

      if (range) {
        // Handle range requests - allow client to control chunk size
        const parts = range.replace(/bytes=/, '').split('-')
        const start = Number.parseInt(parts[0] ?? '0', 10)
        const requestedEnd = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1

        // Use requested range (client calculates optimal chunk size)
        const end = Math.min(requestedEnd, fileSize - 1)
        const chunksize = end - start + 1

        const file = fs.createReadStream(filePath, { start, end })

        res.status(206)
        res.set({
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': contentType,
          ...(trackDuration ? { 'X-Track-Duration': trackDuration.toString() } : {}),
        })

        return new StreamableFile(file, {
          length: chunksize,
          type: contentType,
        })
      } else {
        // Handle normal requests - return full file
        res.set({
          'Content-Length': fileSize.toString(),
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
          ...(trackDuration ? { 'X-Track-Duration': trackDuration.toString() } : {}),
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
    @Body('currentTime') currentTime: number = 0,
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
        cover: track.cover,
      },
    })

    return {
      success: true,
      message: 'Track playback started',
      trackId,
      currentTime,
    }
  }

  @ApiOperation({ summary: 'Pause track for authenticated user' })
  @Auth()
  @Post('pause/:id')
  async pauseTrack(
    @Param('id', ParseUUIDPipe) trackId: string,
    @Req() req: Request,
    @Body('currentTime') currentTime: number = 0,
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
      userId: user.id,
    })

    return {
      success: true,
      message: 'Track playback paused',
      trackId,
      currentTime,
    }
  }

  @ApiOperation({
    summary: 'Update track streaming state for authenticated user',
  })
  @Auth()
  @Post('update-state/:id')
  async updateTrackState(
    @Param('id', ParseUUIDPipe) trackId: string,
    @Req() req: Request,
    @Body() body: { currentTime: number; isPlaying: boolean },
  ) {
    const user = req['user'] as UserEntity

    if (typeof body.currentTime !== 'number' || typeof body.isPlaying !== 'boolean') {
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
      userId: user.id,
    })

    return {
      success: true,
      message: 'Track state updated',
      trackId,
      currentTime: body.currentTime,
      isPlaying: body.isPlaying,
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
      userId: user.id,
    }
  }
}
