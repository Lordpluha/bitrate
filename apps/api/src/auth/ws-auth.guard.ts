import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { TokenService } from './token.service'

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name)

  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<
        Socket & {
          userId?: string
          username?: string
        }
      >()
      const token = this.extractTokenFromClient(client)

      if (!token) {
        throw new WsException('No token provided')
      }

      const payload = await this.tokenService.verifyToken(token)

      // Добавляем данные пользователя в контекст
      client.userId = payload.sub
      client.username = payload.username

      return true
    } catch (error) {
      this.logger.error(
        'WebSocket authentication failed:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      throw new WsException('Unauthorized')
    }
  }
  private extractTokenFromClient(client: Socket): string | null {
    // Проверяем auth в handshake
    const authToken = client.handshake.auth?.token as string | undefined

    // Проверяем Authorization header
    const headerAuth = client.handshake.headers.authorization
    const headerToken = headerAuth ? headerAuth.replace('Bearer ', '') : undefined

    // Проверяем query параметры
    const queryToken = client.handshake.query?.token as string | undefined

    // Проверяем cookies
    const cookieHeader = client.handshake.headers.cookie
    let cookieToken: string | undefined
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce(
        (acc, cookie) => {
          const [name, value] = cookie.trim().split('=')
          acc[name] = value
          return acc
        },
        {} as Record<string, string>,
      )

      cookieToken = cookies[process.env.ACCESS_TOKEN_NAME || 'access_token']
    }

    return authToken || headerToken || queryToken || cookieToken || null
  }
}
