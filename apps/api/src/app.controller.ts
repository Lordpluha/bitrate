import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Welcome')
@Controller()
export class AppController {
  @Get()
  getWelcome(): string {
    return `Welcome to ${process.env.npm_package_name}!`
  }
}
