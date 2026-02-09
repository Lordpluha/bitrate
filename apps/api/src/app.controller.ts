import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Welcome')
@Controller()
export class AppController {
  @Get()
  getWelcome(): string {
    return `Welcome to ${process.env.npm_package_name}!`
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: process.env.npm_package_name ?? 'api',
      version: process.env.npm_package_version ?? 'unknown',
      env: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    }
  }
}
