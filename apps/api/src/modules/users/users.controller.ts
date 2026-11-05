import { SafeUserEntity } from '@modules/users'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
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
import { UserFollowsService } from './user-follows.service'
import { MAX_AVATAR_BYTES, UsersService } from './users.service'

@ApiExtraModels(UserEntity, SafeUserEntity)
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private usersService: UsersService,
    private userFollowsService: UserFollowsService,
  ) {}

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
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(UpdateUserSchema)) userData: UpdateUserDto,
  ) {
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
  async uploadAvatar(@CurrentUser() user: UserEntity, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Avatar file is required')
    return await this.usersService.uploadAvatar(user.id, file)
  }

  @FollowUserSwagger()
  @UserAuth()
  @HttpCode(204)
  @Post(':id/follow')
  follow(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.userFollowsService.followUser(user.id, id)
  }

  @UnfollowUserSwagger()
  @UserAuth()
  @HttpCode(204)
  @Delete(':id/follow')
  unfollow(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.userFollowsService.unfollowUser(user.id, id)
  }

  @GetFollowingSwagger()
  @UserAuth()
  @Get('me/following')
  following(
    @CurrentUser() user: UserEntity,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userFollowsService.getFollowing(user.id, page, limit)
  }

  /** What the people the caller follows last played. Declared after `me/following`, before `:id/…`. */
  @GetFollowingActivitySwagger()
  @UserAuth()
  @Get('me/following/activity')
  followingActivity(
    @CurrentUser() user: UserEntity,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userFollowsService.getFollowingActivity(user.id, limit)
  }

  @GetFollowListSwagger('followers')
  @OptionalUserAuth()
  @Get(':id/followers')
  followers(
    @CurrentUser() user: UserEntity | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userFollowsService.listFollows('followers', id, user?.id, page, limit)
  }

  @GetFollowListSwagger('following')
  @OptionalUserAuth()
  @Get(':id/following')
  followingOf(
    @CurrentUser() user: UserEntity | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userFollowsService.listFollows('following', id, user?.id, page, limit)
  }
}
