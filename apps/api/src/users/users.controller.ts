import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
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
import { diskStorage } from 'multer'
import { ZodValidationPipe } from 'nestjs-zod'
import { extname } from 'path'
import { Auth } from 'src/auth/auth.guard'
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

@ApiExtraModels(UserEntity)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @GetUsersSwagger()
  @Get('')
  async getAll(
    @Query('limit', new ZodValidationPipe(z.number())) limit?: number,
    @Query('page', new ZodValidationPipe(z.number())) page?: number,
    @Query('username', new ZodValidationPipe(z.string()))
    username?: UserEntity['username'],
  ) {
    if (!username) {
      return Promise.reject(new Error('User not found'))
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
  @Auth()
  @Put('')
  async putById(
    @Req() req: Request,
    @Body(new ZodValidationPipe(UpdateUserSchema)) userData: UpdateUserDto,
  ) {
    const user = req['user'] as UserEntity
    return await this.usersService.updateById(user.id, userData)
  }

  @UploadAvatarSwagger()
  @Auth()
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/users/avatars',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}${extname(file.originalname)}`
          cb(null, uniqueName)
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/webp']
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type'), false)
        }
        cb(null, true)
      },
    }),
  )
  async uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const user = req['user'] as UserEntity
    return await this.usersService.uploadAvatar(user.id, file.filename)
  }
}
