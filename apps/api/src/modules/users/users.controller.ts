import { randomUUID } from 'node:crypto'
import { open, unlink } from 'node:fs/promises'
import { extname } from 'node:path'
import { isAllowedImageBuffer } from '@common/utils/image'
import { SafeUserEntity } from '@modules/users'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  BadRequestException,
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

/** Represents the users controller. */
@ApiExtraModels(UserEntity, SafeUserEntity)
@ApiTags('Users')
@Controller('users')
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
        destination: './storage/public/users/avatars',
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`)
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

    const buf = Buffer.alloc(12)
    const fd = await open(file.path, 'r')
    try {
      await fd.read(buf, 0, 12, 0)
    } finally {
      await fd.close()
    }
    if (!isAllowedImageBuffer(buf)) {
      await unlink(file.path)
      throw new BadRequestException('Invalid file content')
    }

    const user = req.user as UserEntity
    return await this.usersService.uploadAvatar(user.id, file.filename)
  }
}
