import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common'
import { UsersService } from './users.service'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { UserEntity } from './entities'
import { AuthGuard } from 'src/auth/auth.guard'
import { JWTPayload } from 'src/auth/types'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import {
  UploadAvatarSwagger,
  GetUsersSwagger,
  GetUserByUsernameSwagger,
  PutUserSwagger,
  GetUserSwagger
} from './decorators'
import { UpdateUserDto, UpdateUserSchema } from './dtos'
import { ZodValidationPipe } from 'nestjs-zod'
import * as z from 'zod'

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
    username?: UserEntity['username']
  ) {
    if (!username) {
      return Promise.reject(new Error('User not found'))
    }
    return await this.usersService.findAll({
      username,
      page,
      limit
    })
  }

  @GetUserByUsernameSwagger()
  @Get('username/:username')
  async getByUsername(
    @Param('username', new ZodValidationPipe(z.string()))
    username: UserEntity['username']
  ) {
    return await this.usersService.getByUsername(username)
  }

  @GetUserSwagger()
  @Get(':id')
  async getById(
    @Param('id', new ZodValidationPipe(z.string())) id: UserEntity['id']
  ) {
    return await this.usersService.findById(id)
  }

  @PutUserSwagger()
  @UseGuards(AuthGuard)
  @Put('')
  async putById(
    @Req() req: Request,
    @Body(new ZodValidationPipe(UpdateUserSchema)) userData: UpdateUserDto
  ) {
    const jwtUser = req['user'] as JWTPayload
    return await this.usersService.updateById(jwtUser.sub, userData)
  }

  @UploadAvatarSwagger()
  @UseGuards(AuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/users/avatars',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}${extname(file.originalname)}`
          cb(null, uniqueName)
        }
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/webp']
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type'), false)
        }
        cb(null, true)
      }
    })
  )
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File
  ) {
    const jwtUser = req['user'] as JWTPayload
    return await this.usersService.uploadAvatar(jwtUser.sub, file.filename)
  }
}
