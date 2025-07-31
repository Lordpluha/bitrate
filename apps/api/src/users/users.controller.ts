import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { UsersService } from './users.service'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { UserEntity } from './entities'
import { AuthGuard } from 'src/auth/auth.guard'
import { JWTPayload } from 'src/auth/types'

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
}
