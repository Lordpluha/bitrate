import { PrismaService } from '@infra/prisma/prisma.service'
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { TokenService } from '../tokens/token.service'

/**
 * How long a socket's confirmed session is trusted before the next message checks it again.
 * Bounds how long a revoked session, an expired token or a removed account keeps a live socket.
 */
export const WS_SESSION_RECHECK_MS = 30_000

/** A socket the guard attaches the signed-in user to. */
export type WsAuthClient = Socket & {
  userId?: string
  username?: string
  /** When the session behind the socket was last confirmed, in epoch milliseconds. */
  sessionCheckedAt?: number
}

/**
 * Authenticates listener sockets from the access-token cookie of the handshake. The full check
 * (token signature, live session, active account) runs on connect and again once
 * {@link WS_SESSION_RECHECK_MS} has passed; messages in between reuse the confirmed result.
 * A socket that fails a re-check is disconnected.
 */
@Injectable()
export class WsUserAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsUserAuthGuard.name, { timestamp: true })

  constructor(
    private tokenService: TokenService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<WsAuthClient>()
    const checkedAt = client.sessionCheckedAt
    if (
      client.userId &&
      checkedAt !== undefined &&
      Date.now() - checkedAt < WS_SESSION_RECHECK_MS
    ) {
      return true
    }

    try {
      await this.authenticate(client)
      return true
    } catch (error) {
      this.logger.error(
        'WebSocket authentication failed:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      // The socket was signed in before: its session ended, so it must not stay open.
      if (checkedAt !== undefined) {
        client.sessionCheckedAt = undefined
        client.disconnect()
      }
      throw new WsException('Unauthorized')
    }
  }

  /** Verifies the token and its session, then records the user on the socket. */
  private async authenticate(client: WsAuthClient): Promise<void> {
    const token = this.extractTokenFromClient(client)
    if (!token) {
      throw new WsException('No token provided')
    }

    const payload = await this.tokenService.verifyToken(token)
    if (payload.type !== 'user') {
      throw new WsException('Invalid token type')
    }

    // One query covers both a revoked session and a soft-deleted account.
    const session = await this.prisma.userSession.findFirst({
      where: {
        userId: payload.sub,
        access_token: this.tokenService.hashToken(token),
        user: { deletedAt: null },
      },
      select: { id: true },
    })
    if (!session) {
      throw new WsException('Session not found or revoked')
    }

    client.userId = payload.sub
    client.username = payload.username
    client.sessionCheckedAt = Date.now()
  }

  private extractTokenFromClient(client: Socket): string | null {
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
