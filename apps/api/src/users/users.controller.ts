import { Controller, Get, Param } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('by-id/:id')
  getById(@Param('id') id: string) {
    return this.usersService.findUserById(id)
  }

  @Get('by-username/:username')
  getByUsername(@Param('username') username: string) {
    return this.usersService.findUserByUsername(username)
  }
}
