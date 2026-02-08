import { websocketConfig } from '@common/config/connections'
import { WsUserAuthGuard } from '@modules/users-auth/users-auth.ws.guard'
import { Logger, UseGuards } from '@nestjs/common'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
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
import { z } from 'zod'
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
@UseGuards(WsUserAuthGuard)
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(AudioGateway.name, { timestamp: true })
  private userSessions = new Map<string, string>() // userId -> socketId
  private playingSessions = new Map<string, PlayingSession>() // userId -> playing track info

  private readonly trackPayloadSchema = z.object({
    trackId: z.uuidv7(),
    currentTime: z.number().min(0),
  })

  private readonly updatePayloadSchema = this.trackPayloadSchema.extend({
    isPlaying: z.boolean(),
  })

  constructor(
    private tracksService: TracksService,
    private wsAuthGuard: WsUserAuthGuard,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      await this.wsAuthGuard.canActivate(this.createWsContext(client))

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

      const parsed = this.trackPayloadSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error('Invalid payload')
      }

      // Verify track exists
      const track = await this.tracksService.findTrackById(parsed.data.trackId)
      if (!track) {
        throw new Error('Track not found')
      }

      // Update user's playing session
      this.playingSessions.set(client.userId, {
        trackId: parsed.data.trackId,
        currentTime: parsed.data.currentTime,
        timestamp: Date.now(),
      })

      // Emit only to the user's personal room
      this.server.to(`user_${client.userId}`).emit('trackPlaying', {
        trackId: parsed.data.trackId,
        currentTime: parsed.data.currentTime,
        userId: client.userId,
      })

      return {
        event: 'playTrack',
        data: {
          success: true,
          trackId: parsed.data.trackId,
          currentTime: parsed.data.currentTime,
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

      const parsed = this.trackPayloadSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error('Invalid payload')
      }

      // Remove from playing sessions
      this.playingSessions.delete(client.userId)

      // Emit only to the user's personal room
      this.server.to(`user_${client.userId}`).emit('trackPaused', {
        trackId: parsed.data.trackId,
        currentTime: parsed.data.currentTime,
        userId: client.userId,
      })

      return {
        event: 'pauseTrack',
        data: {
          success: true,
          trackId: parsed.data.trackId,
          currentTime: parsed.data.currentTime,
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

      const parsed = this.updatePayloadSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error('Invalid payload')
      }

      if (parsed.data.isPlaying) {
        this.playingSessions.set(client.userId, {
          trackId: parsed.data.trackId,
          currentTime: parsed.data.currentTime,
          timestamp: Date.now(),
        })
      } else {
        this.playingSessions.delete(client.userId)
      }

      // Emit only to the user's personal room
      this.server.to(`user_${client.userId}`).emit('trackUpdated', {
        trackId: parsed.data.trackId,
        currentTime: parsed.data.currentTime,
        isPlaying: parsed.data.isPlaying,
        userId: client.userId,
      })

      return {
        event: 'updateStreaming',
        data: {
          success: true,
          trackId: parsed.data.trackId,
          currentTime: parsed.data.currentTime,
          isPlaying: parsed.data.isPlaying,
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

  private createWsContext(client: AuthenticatedSocket) {
    const context = new ExecutionContextHost([client])
    context.setType('ws')
    return context
  }

  // Method to emit events from controller
  emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
    this.server.to(`user_${userId}`).emit(event, data)
  }
}
