import { ArtistEntity } from '@modules/artists'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { UserEntity } from '@modules/users'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
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
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { randomUUID } from 'crypto'
import { Request, Response } from 'express'
import { diskStorage } from 'multer'
import { ZodValidationPipe } from 'nestjs-zod'
import { extname } from 'path'
import {
  GetTrackByIdSwagger,
  PostTrackSwagger,
  TracksGetAllSwagger,
  UpdateTrackByIdSwagger,
} from './decorators'
import { CreateTrackDto, CreateTrackSchema } from './dtos/create-track.dto'
import { TrackEntity } from './entities'
import { TracksService } from './tracks.service'

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
    @Query('title') title?: TrackEntity['title'],
  ) {
    return this.tracksService.findAll({
      limit,
      page,
      title,
    })
  }

  @GetTrackByIdSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.findTrackById(id)
  }

  @UserAuth()
  @Get('stream/:id')
  async streamTrack(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const range = req.headers.range
    const streamData = await this.tracksService.getTrackStream(id, range)

    res.status(streamData.isPartial ? 206 : 200)
    res.set({
      'Content-Type': streamData.contentType,
      'Accept-Ranges': 'bytes',
      'Content-Length': streamData.contentLength,
      ...(streamData.isPartial
        ? {
            'Content-Range': `bytes ${streamData.start}-${streamData.end}/${streamData.fileSize}`,
          }
        : {}),
    })

    return streamData.stream.pipe(res)
  }

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
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'audio') {
              return cb(null, './storage/private/tracks')
            }
            return cb(null, './storage/public/tracks/covers')
          },
          filename: (req, file, cb) => {
            const uniqueName = `${randomUUID()}${extname(file.originalname)}`
            cb(null, uniqueName)
          },
        }),
        fileFilter: (req, file, cb) => {
          const audioTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm']
          const coverTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']

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
    const artist = req['artist'] as ArtistEntity
    const audioFile = files?.audio?.[0]
    const coverFile = files?.cover?.[0]

    if (!audioFile) {
      throw new BadRequestException('Audio file is required')
    }

    return this.tracksService.create(artist.id, createTrackDto, audioFile, coverFile)
  }

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
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'audio') {
              return cb(null, './storage/private/tracks')
            }
            return cb(null, './storage/public/tracks/covers')
          },
          filename: (req, file, cb) => {
            const uniqueName = `${randomUUID()}${extname(file.originalname)}`
            cb(null, uniqueName)
          },
        }),
        fileFilter: (req, file, cb) => {
          const audioTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm']
          const coverTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']

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
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const audioFile = files?.audio?.[0]
    const coverFile = files?.cover?.[0]

    return this.tracksService.update(id, createTrackDto, audioFile, coverFile)
  }

  @ApiOperation({ summary: 'Get liked tracks of the authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/TrackEntity' },
    },
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UserAuth()
  @Get('liked')
  getLikedTracks(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const artist = req['user'] as UserEntity
    return this.tracksService.findLikedTracks(artist.id, {
      page,
      limit,
    })
  }
}
