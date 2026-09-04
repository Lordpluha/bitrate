import { randomUUID } from 'node:crypto'
import { open, unlink } from 'node:fs/promises'
import { detectAllowedImageMime, IMAGE_EXTENSION_BY_MIME } from '@common/utils/image'
import { resolveSafeMulterPath } from '@common/utils/multer-file'
import { SafeUserEntity } from '@modules/users'
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { diskStorage } from 'multer'
import { ZodValidationPipe } from 'nestjs-zod'
import * as z from 'zod'
import {
  GetUserByUsernameSwagger,
  GetUserSwagger,
  GetUsersSwagger,
  PutUserSwagger,
  UploadAvatarSwagger,
} from './decorators'
import { UpdateUserDto, UpdateUserSchema } from './dtos'
import { UserEntity } from './entities'
import { UsersService } from './users.service'

/** Where avatar uploads are written. Server-owned, so it can be joined into a path safely. */
const AVATAR_DESTINATION = './storage/public/users/avatars'

/** Represents the users controller. */
@ApiExtraModels(UserEntity, SafeUserEntity)
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private usersService: UsersService) {}

  /** Runs the get all operation. */
  @GetUsersSwagger()
  @Get('')
  async getAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('username') username?: UserEntity['username'],
  ) {
    if (!username) {
      throw new BadRequestException('Username query is required')
    }
    return await this.usersService.findAll({
      username,
      page,
      limit,
    })
  }

  /** Runs the get by username operation. */
  @GetUserByUsernameSwagger()
  @Get('username/:username')
  async getByUsername(
    @Param('username', new ZodValidationPipe(z.string()))
    username: UserEntity['username'],
  ) {
    return await this.usersService.getByUsername(username)
  }

  /** Runs the get by id operation. */
  @GetUserSwagger()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: UserEntity['id']) {
    return await this.usersService.findById(id)
  }

  /** Runs the put by id operation. */
  @PutUserSwagger()
  @UserAuth()
  @Put('')
  async putById(
    @Req() req: Request,
    @Body(new ZodValidationPipe(UpdateUserSchema)) userData: UpdateUserDto,
  ) {
    const user = req.user as UserEntity
    return await this.usersService.updateById(user.id, userData)
  }

  /** Runs the upload avatar operation. */
  @UploadAvatarSwagger()
  @UserAuth()
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: diskStorage({
        destination: AVATAR_DESTINATION,
        filename: (_req, file, cb) => {
          const extension =
            IMAGE_EXTENSION_BY_MIME[file.mimetype as keyof typeof IMAGE_EXTENSION_BY_MIME]
          cb(null, `${randomUUID()}${extension}`)
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/webp']
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type'), false)
        }
        cb(null, true)
      },
    }),
  )
  async uploadAvatar(@Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Avatar file is required')

    const safePath = resolveSafeMulterPath(file, AVATAR_DESTINATION)
    const buf = Buffer.alloc(12)
    const fd = await open(safePath, 'r')
    try {
      await fd.read(buf, 0, 12, 0)
    } finally {
      await fd.close()
    }
    if (detectAllowedImageMime(buf) !== file.mimetype) {
      await unlink(safePath)
      throw new BadRequestException('Invalid file content')
    }

    const user = req.user as UserEntity
    try {
      return await this.usersService.uploadAvatar(user.id, file.filename)
    } catch (error) {
      await unlink(safePath)
      throw error
    }
  }

  @UserAuth()
  @HttpCode(204)
  @Post(':id/follow')
  follow(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.followUser((req.user as UserEntity).id, id)
  }

  @UserAuth()
  @HttpCode(204)
  @Delete(':id/follow')
  unfollow(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.unfollowUser((req.user as UserEntity).id, id)
  }

  @UserAuth()
  @Get('me/following')
  following(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.usersService.getFollowing((req.user as UserEntity).id, page, limit)
  }
}
