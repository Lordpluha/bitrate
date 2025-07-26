import { Controller, Get, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { UserEntity } from './entities'

@ApiExtraModels(UserEntity)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('users')
  getById(
    @Query('id') id?: UserEntity['id'],
    @Query('username') username?: UserEntity['username']
  ) {
    if (!id && !username) {
      return Promise.reject(new Error('User not found'))
    }
    if (id && username) {
      return Promise.reject(
        new Error('Please provide either id or username, not both')
      )
    }
    if (id) {
      return this.usersService.findUserById(id)
    } else if (username) {
      return this.usersService.findUserByUsername(username)
    }
  }
}
