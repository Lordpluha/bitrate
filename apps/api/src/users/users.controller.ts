import { Body, Controller, Get, Param, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { UserEntity } from './entities'

@ApiExtraModels(UserEntity)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('')
  getAll(@Query('username') username?: UserEntity['username']) {
    if (!username) {
      return Promise.reject(new Error('User not found'))
    }
    return this.usersService.findUserByUsername(username)
  }

  @Get(':id')
  getById(@Param('id') id: UserEntity['id']) {
    return this.usersService.findUserById(id)
  }

  putById(
    @Param('id') id: UserEntity['id'],
    @Body() userData: Partial<UserEntity>
  ) {
    return this.usersService.updateUserById(id, userData)
  }
}
