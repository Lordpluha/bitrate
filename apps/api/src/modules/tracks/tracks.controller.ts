import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import type { ArtistEntity } from '@modules/artists'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { UserEntity } from '@modules/users'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { diskStorage } from 'multer'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  GetTrackByIdSwagger,
  LikeTrackSwagger,
  PostTrackSwagger,
  StreamTrackSwagger,
  TracksGetAllSwagger,
  TracksGetLikedSwagger,
  UnlikeTrackSwagger,
  UpdateTrackByIdSwagger,
} from './decorators'
import { type CreateTrackDto, CreateTrackSchema } from './dtos/create-track.dto'
import { TrackEntity } from './entities'
import { TracksService } from './tracks.service'

/** Represents the tracks controller. */
@ApiExtraModels(TrackEntity)
@ApiTags('Tracks')
@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  /** Runs the get all operation. */
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

  /** Runs the get hls master playlist operation. */
  @UserAuth()
  @Get('stream/:id/hls/master.m3u8')
  async getHlsMasterPlaylist(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Res() res: Response,
  ) {
    const playlist = await this.tracksService.getHlsMasterPlaylist(id)
    res.set({
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'private, max-age=5, no-transform',
    })
    return res.send(playlist)
  }

  /** Runs the get hls asset operation. */
  @UserAuth()
  @Get('stream/:id/hls/:bitrate/:asset')
  async getHlsAsset(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Param('bitrate', ParseIntPipe) bitrate: number,
    @Param('asset') asset: string,
    @Res() res: Response,
  ) {
    const data = await this.tracksService.getHlsAsset(id, bitrate, asset)
    res.set({
      'Content-Type': data.contentType,
      'Content-Length': data.contentLength,
      'Cache-Control': data.immutable
        ? 'private, max-age=31536000, immutable, no-transform'
        : 'private, max-age=30, no-transform',
    })
    return data.stream.pipe(res)
  }

  /** Runs the stream track operation. */
  @StreamTrackSwagger()
  @UserAuth()
  @Get('stream/:id')
  async streamTrack(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Req() req: Request,
    @Res() res: Response,
    @Query('bitrate', new ParseIntPipe({ optional: true })) bitrate?: number,
    @Query('format') format?: string,
  ) {
    const range = req.headers.range
    const streamData = await this.tracksService.getTrackStream(id, range, bitrate, format)

    res.status(streamData.isPartial ? 206 : 200)
    res.set({
      'Content-Type': streamData.contentType,
      'Accept-Ranges': 'bytes',
      'Content-Length': streamData.contentLength,
      'Cache-Control': 'private, max-age=3600, no-transform',
      'X-Audio-Bitrate': streamData.bitrate,
      'X-Audio-Format': streamData.format,
      ...(streamData.isPartial
        ? {
            'Content-Range': `bytes ${streamData.start}-${streamData.end}/${streamData.fileSize}`,
          }
        : {}),
    })

    return streamData.stream.pipe(res)
  }

  /** Runs the post track operation. */
  @PostTrackSwagger()
  @ArtistAuth()
  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        limits: { fileSize: 50 * 1024 * 1024 },
        storage: diskStorage({
          destination: (_req, file, cb) => {
            if (file.fieldname === 'audio') {
              return cb(null, './storage/private/tracks')
            }
            return cb(null, './storage/public/tracks/covers')
          },
          filename: (_req, file, cb) => {
            const uniqueName = `${randomUUID()}${extname(file.originalname)}`
            cb(null, uniqueName)
          },
        }),
        fileFilter: (_req, file, cb) => {
          const audioTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm']
          const coverTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp']

          if (file.fieldname === 'audio' && !audioTypes.includes(file.mimetype)) {
            return cb(new BadRequestException('Invalid audio file type'), false)
          }

          if (file.fieldname === 'cover' && !coverTypes.includes(file.mimetype)) {
            return cb(new BadRequestException('Invalid cover file type'), false)
          }

          cb(null, true)
        },
      },
    ),
  )
  postTrack(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const artist = req.artist as ArtistEntity
    const audioFile = files?.audio?.[0]
    const coverFile = files?.cover?.[0]

    if (!audioFile) {
      throw new BadRequestException('Audio file is required')
    }

    return this.tracksService.create(artist.id, createTrackDto, audioFile, coverFile)
  }

  /** Runs the put track operation. */
  @UpdateTrackByIdSwagger()
  @ArtistAuth()
  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        limits: { fileSize: 50 * 1024 * 1024 },
        storage: diskStorage({
          destination: (_req, file, cb) => {
            if (file.fieldname === 'audio') {
              return cb(null, './storage/private/tracks')
            }
            return cb(null, './storage/public/tracks/covers')
          },
          filename: (_req, file, cb) => {
            const uniqueName = `${randomUUID()}${extname(file.originalname)}`
            cb(null, uniqueName)
          },
        }),
        fileFilter: (_req, file, cb) => {
          const audioTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm']
          const coverTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp']

          if (file.fieldname === 'audio' && !audioTypes.includes(file.mimetype)) {
            return cb(new BadRequestException('Invalid audio file type'), false)
          }

          if (file.fieldname === 'cover' && !coverTypes.includes(file.mimetype)) {
            return cb(new BadRequestException('Invalid cover file type'), false)
          }

          cb(null, true)
        },
      },
    ),
  )
  putTrack(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const audioFile = files?.audio?.[0]
    const coverFile = files?.cover?.[0]

    const artist = req.artist as ArtistEntity
    return this.tracksService.update(artist.id, id, createTrackDto, audioFile, coverFile)
  }

  /** Runs the get liked tracks operation. */
  @TracksGetLikedSwagger()
  @UserAuth()
  @Get('liked')
  getLikedTracks(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const artist = req.user as UserEntity
    return this.tracksService.findLikedTracks(artist.id, {
      page,
      limit,
    })
  }

  /** Runs the get by id operation. */
  @GetTrackByIdSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.findTrackById(id)
  }

  /** Runs the like track operation. */
  @LikeTrackSwagger()
  @UserAuth()
  @Post(':id/like')
  likeTrack(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.like(req.user.id, id)
  }

  /** Runs the unlike track operation. */
  @UnlikeTrackSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/like')
  unlikeTrack(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.unlike(req.user.id, id)
  }
}
