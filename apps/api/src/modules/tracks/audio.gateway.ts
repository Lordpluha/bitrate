import type { AppConfig } from '@common/config'
import { websocketConfig } from '@common/config/connections'
import { TokenService } from '@modules/tokens/token.service'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PauseTrackDto, StartTrackDto, UpdateStreamingDto } from './dtos'
import { TracksService } from './tracks.service'

interface AuthenticatedSocket extends Socket {
  userId?: string
}

interface PlayingSession {
  trackId: string
  currentTime: number
  timestamp: number
}

@WebSocketGateway(websocketConfig)
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(AudioGateway.name, { timestamp: true })
  private userSessions = new Map<string, string>() // userId -> socketId
  private playingSessions = new Map<string, PlayingSession>() // userId -> playing track info

  constructor(
    private tracksService: TracksService,
    private tokenService: TokenService,
    private configService: ConfigService<AppConfig>,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token ONLY from httpOnly cookies
      const cookieHeader = client.handshake.headers.cookie
      let token: string | undefined

      if (cookieHeader) {
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
        token = cookies[this.configService.getOrThrow('ACCESS_TOKEN_NAME')]
      }

      if (!token) {
        this.logger.error('No authentication cookie found')
        client.disconnect()
        return
      }

      // Verify token and set user data
      const payload = await this.tokenService.verifyToken(token)
      client.userId = payload.sub

      if (!client.userId) {
        this.logger.error('Invalid token payload - no user ID')
        client.disconnect()
        return
      }

      this.userSessions.set(client.userId, client.id)
      this.logger.log(`User ${client.userId} connected with socket ${client.id}`)

      // Join user to their personal room
      void client.join(`user_${client.userId}`)

      // Send current playing state if exists
      const currentSession = this.playingSessions.get(client.userId)
      if (currentSession) {
        client.emit('trackState', {
          trackId: currentSession.trackId,
          currentTime: this.calculateCurrentTime(currentSession),
          isPlaying: true,
        })
      }
    } catch (error) {
      this.logger.error(
        'Authentication failed:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      client.disconnect()
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      this.userSessions.delete(client.userId)
      this.logger.log(`User ${client.userId} disconnected`)
    }
  }

  @SubscribeMessage('playTrack')
  async handlePlayTrack(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: StartTrackDto,
  ): Promise<WsResponse> {
    try {
      if (!client.userId) {
        throw new Error('Unauthorized')
      }

      // Verify track exists
      const track = await this.tracksService.findTrackById(payload.trackId)
      if (!track) {
        throw new Error('Track not found')
      }

      // Update user's playing session
      this.playingSessions.set(client.userId, {
        trackId: payload.trackId,
        currentTime: payload.currentTime,
        timestamp: Date.now(),
      })

      // Emit only to the user's personal room
      this.server.to(`user_${client.userId}`).emit('trackPlaying', {
        trackId: payload.trackId,
        currentTime: payload.currentTime,
        userId: client.userId,
      })

      return {
        event: 'playTrack',
        data: {
          success: true,
          trackId: payload.trackId,
          currentTime: payload.currentTime,
        },
      }
    } catch (error) {
      this.logger.error(
        'Error playing track:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      return {
        event: 'playTrack',
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  @SubscribeMessage('pauseTrack')
  handlePauseTrack(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: PauseTrackDto,
  ): WsResponse {
    try {
      if (!client.userId) {
        throw new Error('Unauthorized')
      }

      // Remove from playing sessions
      this.playingSessions.delete(client.userId)

      // Emit only to the user's personal room
      this.server.to(`user_${client.userId}`).emit('trackPaused', {
        trackId: payload.trackId,
        currentTime: payload.currentTime,
        userId: client.userId,
      })

      return {
        event: 'pauseTrack',
        data: {
          success: true,
          trackId: payload.trackId,
          currentTime: payload.currentTime,
        },
      }
    } catch (error) {
      this.logger.error(
        'Error pausing track:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      return {
        event: 'pauseTrack',
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  @SubscribeMessage('updateStreaming')
  handleUpdateStreaming(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateStreamingDto,
  ): WsResponse {
    try {
      if (!client.userId) {
        throw new Error('Unauthorized')
      }

      if (payload.isPlaying) {
        this.playingSessions.set(client.userId, {
          trackId: payload.trackId,
          currentTime: payload.currentTime,
          timestamp: Date.now(),
        })
      } else {
        this.playingSessions.delete(client.userId)
      }

      // Emit only to the user's personal room
      this.server.to(`user_${client.userId}`).emit('trackUpdated', {
        trackId: payload.trackId,
        currentTime: payload.currentTime,
        isPlaying: payload.isPlaying,
        userId: client.userId,
      })

      return {
        event: 'updateStreaming',
        data: {
          success: true,
          trackId: payload.trackId,
          currentTime: payload.currentTime,
          isPlaying: payload.isPlaying,
        },
      }
    } catch (error) {
      this.logger.error(
        'Error updating streaming:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      return {
        event: 'updateStreaming',
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  @SubscribeMessage('getCurrentState')
  handleGetCurrentState(@ConnectedSocket() client: AuthenticatedSocket): WsResponse {
    if (!client.userId) {
      return { event: 'currentState', data: { error: 'Unauthorized' } }
    }

    const currentSession = this.playingSessions.get(client.userId)
    if (currentSession) {
      return {
        event: 'currentState',
        data: {
          trackId: currentSession.trackId,
          currentTime: this.calculateCurrentTime(currentSession),
          isPlaying: true,
        },
      }
    }

    return {
      event: 'currentState',
      data: {
        isPlaying: false,
      },
    }
  }

  private calculateCurrentTime(session: PlayingSession): number {
    const elapsed = (Date.now() - session.timestamp) / 1000
    return session.currentTime + elapsed
  }

  // Method to emit events from controller
  emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
    this.server.to(`user_${userId}`).emit(event, data)
  }
}
