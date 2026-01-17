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
    // Проверяем ТОЛЬКО httpOnly cookies
    const cookieHeader = client.handshake.headers.cookie

    if (!cookieHeader) {
      return null
    }

    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.trim().split('=')
        if (name && value) {
          acc[name] = value
        }
        return acc
      },
      {} as Record<string, string>,
    )

    return cookies[process.env.ACCESS_TOKEN_NAME!] || null
  }
}
