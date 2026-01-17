import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getWelcome() {
    return `Welcome to ${process.env.npm_package_name}!`
  }
}
