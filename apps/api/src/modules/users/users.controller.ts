import { SafeUserEntity } from '@modules/users'
import type { OptionalUserAuthRequest } from '@modules/users-auth/types'
import { OptionalUserAuth, UserAuth } from '@modules/users-auth/users-auth.guard'
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
import { memoryStorage } from 'multer'
import { ZodValidationPipe } from 'nestjs-zod'
import * as z from 'zod'
import {
  FollowUserSwagger,
  GetFollowingActivitySwagger,
  GetFollowingSwagger,
  GetFollowListSwagger,
  GetUserByUsernameSwagger,
  GetUserSwagger,
  GetUsersSwagger,
  PutUserSwagger,
  UnfollowUserSwagger,
  UploadAvatarSwagger,
} from './decorators'
import { UpdateUserDto, UpdateUserSchema } from './dtos'
import { UserEntity } from './entities'
import { MAX_AVATAR_BYTES, UsersService } from './users.service'

@ApiExtraModels(UserEntity, SafeUserEntity)
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private usersService: UsersService) {}

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

  @GetUserByUsernameSwagger()
  @Get('username/:username')
  async getByUsername(
    @Param('username', new ZodValidationPipe(z.string()))
    username: UserEntity['username'],
  ) {
    return await this.usersService.getByUsername(username)
  }

  @GetUserSwagger()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: UserEntity['id']) {
    return await this.usersService.findById(id)
  }

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

  @UploadAvatarSwagger()
  @UserAuth()
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: MAX_AVATAR_BYTES },
      storage: memoryStorage(),
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
    return await this.usersService.uploadAvatar((req.user as UserEntity).id, file)
  }

  @FollowUserSwagger()
  @UserAuth()
  @HttpCode(204)
  @Post(':id/follow')
  follow(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.followUser((req.user as UserEntity).id, id)
  }

  @UnfollowUserSwagger()
  @UserAuth()
  @HttpCode(204)
  @Delete(':id/follow')
  unfollow(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.unfollowUser((req.user as UserEntity).id, id)
  }

  @GetFollowingSwagger()
  @UserAuth()
  @Get('me/following')
  following(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.usersService.getFollowing((req.user as UserEntity).id, page, limit)
  }

  /** What the people the caller follows last played. Declared after `me/following`, before `:id/…`. */
  @GetFollowingActivitySwagger()
  @UserAuth()
  @Get('me/following/activity')
  followingActivity(
    @Req() req: Request,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.usersService.getFollowingActivity((req.user as UserEntity).id, limit)
  }

  @GetFollowListSwagger('followers')
  @OptionalUserAuth()
  @Get(':id/followers')
  followers(
    @Req() req: OptionalUserAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.usersService.listFollows('followers', id, req.user?.id, page, limit)
  }

  @GetFollowListSwagger('following')
  @OptionalUserAuth()
  @Get(':id/following')
  followingOf(
    @Req() req: OptionalUserAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.usersService.listFollows('following', id, req.user?.id, page, limit)
  }
}
