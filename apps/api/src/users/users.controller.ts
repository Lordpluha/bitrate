import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { UserEntity } from './entities'
import { AuthGuard } from 'src/auth/auth.guard'
import { JWTPayload } from 'src/auth/types'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { UploadAvatarSwagger } from './decorators/swagger/upload-avatar.decorator'

@ApiExtraModels(UserEntity)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('')
  getAll(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('username') username?: UserEntity['username']
  ) {
    if (!username) {
      return Promise.reject(new Error('User not found'))
    }
    return this.usersService.findByUsername({
      username,
      page,
      limit
    })
  }

  @Get('username/:username')
  getByUsername(@Param('username') username: UserEntity['username']) {
    return this.usersService.getByUsername(username)
  }

  @Get(':id')
  getById(@Param('id') id: UserEntity['id']) {
    return this.usersService.findById(id)
  }

  @UseGuards(AuthGuard)
  @Put('')
  putById(@Req() req: Request, @Body() userData: Partial<UserEntity>) {
    const jwtUser = req['user'] as JWTPayload
    return this.usersService.updateById(jwtUser.sub, userData)
  }

  @UploadAvatarSwagger()
  @UseGuards(AuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
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
  uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const jwtUser = req['user'] as JWTPayload
    return this.usersService.uploadAvatar(jwtUser.sub, file.filename)
  }
}
