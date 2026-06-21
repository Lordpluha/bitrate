import type { ReadStream } from 'node:fs'
import { websocketConfig } from '@common/config/connections'
import { WsUserAuthGuard } from '@modules/users-auth/users-auth.ws.guard'
import { Inject, Logger, UseGuards } from '@nestjs/common'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type WsResponse,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { z } from 'zod'
import type { PauseTrackDto, StartTrackDto, UpdateStreamingDto } from './dtos'
import * as TracksServiceModule from './tracks.service'

/** Describes the authenticated socket. */
interface AuthenticatedSocket extends Socket {
  /** The user id value. */
  userId?: string
}

/** Describes the playing session. */
interface PlayingSession {
  /** The track id value. */
  trackId: string
  /** The current time value. */
  currentTime: number
  /** The timestamp value. */
  timestamp: number
}

/** Describes the audio stream session. */
interface AudioStreamSession {
  /** The stream value. */
  stream: ReadStream
  /** The track id value. */
  trackId: string
}

/** Describes the stream track payload. */
interface StreamTrackPayload {
  /** The track id value. */
  trackId: string
  /** The bitrate value. */
  bitrate?: number
  /** The format value. */
  format?: string
}

/** The audio chunk ack timeout ms value. */
const AUDIO_CHUNK_ACK_TIMEOUT_MS = 10_000

/** Represents the audio gateway. */
@WebSocketGateway(websocketConfig)
@UseGuards(WsUserAuthGuard)
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /** The server value. */
  @WebSocketServer()
  server: Server

  /** The logger value. */
  private readonly logger = new Logger(AudioGateway.name, { timestamp: true })
  /** The user sessions value. */
  private userSessions = new Map<string, Set<string>>() // userId -> socketIds
  /** The playing sessions value. */
  private playingSessions = new Map<string, PlayingSession>() // userId -> playing track info
  /** The audio streams value. */
  private audioStreams = new Map<string, AudioStreamSession>() // socketId -> active audio stream

  /** The track payload schema value. */
  private readonly trackPayloadSchema = z.object({
    trackId: z.uuidv7(),
    currentTime: z.number().min(0),
  })

  /** The play payload schema value. */
  private readonly playPayloadSchema = this.trackPayloadSchema.extend({
    bitrate: z.number().int().min(1).max(1000).optional(),
    format: z.string().min(1).max(16).default('opus'),
  })

  /** The update payload schema value. */
  private readonly updatePayloadSchema = this.trackPayloadSchema.extend({
    isPlaying: z.boolean(),
  })

  /** The stream payload schema value. */
  private readonly streamPayloadSchema = z.object({
    trackId: z.uuidv7(),
    bitrate: z.number().int().min(1).max(1000).optional(),
    format: z.string().min(1).max(16).default('opus'),
  })

  /** Creates a new instance. */
  constructor(
    @Inject(TracksServiceModule.TracksService)
    private tracksService: TracksServiceModule.TracksService,
    @Inject(WsUserAuthGuard) private wsAuthGuard: WsUserAuthGuard,
  ) {}

  /** Runs the handle connection operation. */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      await this.wsAuthGuard.canActivate(this.createWsContext(client))

      if (!client.userId) {
        this.logger.error('Invalid token payload - no user ID')
        client.disconnect()
        return
      }

      const socketIds = this.userSessions.get(client.userId) ?? new Set<string>()
      socketIds.add(client.id)
      this.userSessions.set(client.userId, socketIds)
      this.logger.log(`User ${client.userId} connected with socket ${client.id}`)

      void client.join(`user_${client.userId}`)

      const currentSession = this.playingSessions.get(client.userId)
      client.emit(
        'trackState',
        currentSession
          ? {
              trackId: currentSession.trackId,
              currentTime: this.calculateCurrentTime(currentSession),
              isPlaying: true,
            }
          : { isPlaying: false },
      )
    } catch (error) {
      this.logger.error(
        'Authentication failed:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      client.disconnect()
    }
  }

  /** Runs the handle disconnect operation. */
  handleDisconnect(client: AuthenticatedSocket): void {
    this.stopAudioStream(client.id)

    if (!client.userId) return

    const socketIds = this.userSessions.get(client.userId)
    socketIds?.delete(client.id)

    if (!socketIds || socketIds.size === 0) {
      this.userSessions.delete(client.userId)
      this.playingSessions.delete(client.userId)
    }

    this.logger.log(`User ${client.userId} disconnected`)
  }

  /** Runs the handle stream track operation. */
  @SubscribeMessage('streamTrack')
  async handleStreamTrack(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ): Promise<WsResponse> {
    try {
      if (!client.userId) throw new Error('Unauthorized')

      const parsed = this.streamPayloadSchema.safeParse(payload)
      if (!parsed.success) throw new Error('Invalid payload')

      const audio = await this.startAudioStream(client, parsed.data)

      return {
        event: 'streamTrack',
        data: { success: true, ...audio },
      }
    } catch (error) {
      this.logger.error(
        'Error streaming track:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      return {
        event: 'streamTrack',
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  /** Runs the handle stop track stream operation. */
  @SubscribeMessage('stopTrackStream')
  handleStopTrackStream(@ConnectedSocket() client: AuthenticatedSocket): WsResponse {
    const stopped = this.stopAudioStream(client.id)
    return { event: 'stopTrackStream', data: { success: true, stopped } }
  }

  /** Runs the handle play track operation. */
  @SubscribeMessage('playTrack')
  async handlePlayTrack(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: StartTrackDto,
  ): Promise<WsResponse> {
    try {
      if (!client.userId) throw new Error('Unauthorized')

      const parsed = this.playPayloadSchema.safeParse(payload)
      if (!parsed.success) throw new Error('Invalid payload')

      const track = await this.tracksService.findTrackById(parsed.data.trackId)
      if (!track) throw new Error('Track not found')

      const audio = await this.startAudioStream(client, parsed.data)
      this.playingSessions.set(client.userId, {
        trackId: parsed.data.trackId,
        currentTime: parsed.data.currentTime,
        timestamp: Date.now(),
      })

      this.server.to(`user_${client.userId}`).emit('trackPlaying', {
        trackId: parsed.data.trackId,
        currentTime: parsed.data.currentTime,
        bitrate: audio.bitrate,
        format: audio.format,
        userId: client.userId,
      })

      return {
        event: 'playTrack',
        data: {
          success: true,
          trackId: parsed.data.trackId,
          currentTime: parsed.data.currentTime,
          bitrate: audio.bitrate,
          format: audio.format,
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

  /** Runs the handle pause track operation. */
  @SubscribeMessage('pauseTrack')
  handlePauseTrack(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: PauseTrackDto,
  ): WsResponse {
    try {
      if (!client.userId) throw new Error('Unauthorized')

      const parsed = this.trackPayloadSchema.safeParse(payload)
      if (!parsed.success) throw new Error('Invalid payload')

      this.playingSessions.delete(client.userId)
      this.stopUserAudioStreams(client.userId)

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

  /** Runs the handle update streaming operation. */
  @SubscribeMessage('updateStreaming')
  async handleUpdateStreaming(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateStreamingDto,
  ): Promise<WsResponse> {
    try {
      if (!client.userId) throw new Error('Unauthorized')

      const parsed = this.updatePayloadSchema.safeParse(payload)
      if (!parsed.success) throw new Error('Invalid payload')

      if (parsed.data.isPlaying) {
        const track = await this.tracksService.findTrackById(parsed.data.trackId)
        if (!track) throw new Error('Track not found')

        this.playingSessions.set(client.userId, {
          trackId: parsed.data.trackId,
          currentTime: parsed.data.currentTime,
          timestamp: Date.now(),
        })
      } else {
        this.playingSessions.delete(client.userId)
        this.stopUserAudioStreams(client.userId)
      }

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

  /** Runs the handle get current state operation. */
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

    return { event: 'currentState', data: { isPlaying: false } }
  }

  /** Runs the start audio stream operation. */
  private async startAudioStream(client: AuthenticatedSocket, payload: StreamTrackPayload) {
    const audio = await this.tracksService.getTrackAudioStream(
      payload.trackId,
      payload.bitrate,
      payload.format,
    )

    this.stopAudioStream(client.id)
    const session: AudioStreamSession = { stream: audio.stream, trackId: audio.trackId }
    this.audioStreams.set(client.id, session)

    client.emit('audioStreamStarted', {
      trackId: audio.trackId,
      bitrate: audio.bitrate,
      format: audio.format,
      codec: audio.codec,
      contentType: audio.contentType,
      size: audio.size,
    })

    void this.pipeAudioStream(client, session)

    return {
      trackId: audio.trackId,
      bitrate: audio.bitrate,
      format: audio.format,
    }
  }

  /** Runs the pipe audio stream operation. */
  private async pipeAudioStream(client: AuthenticatedSocket, session: AudioStreamSession) {
    let sequence = 0

    try {
      for await (const chunk of session.stream) {
        if (this.audioStreams.get(client.id) !== session) return

        await client.timeout(AUDIO_CHUNK_ACK_TIMEOUT_MS).emitWithAck('audioChunk', {
          trackId: session.trackId,
          sequence,
          chunk: Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
        })
        sequence += 1
      }

      if (this.audioStreams.get(client.id) !== session) return

      this.audioStreams.delete(client.id)
      client.emit('audioStreamEnded', { trackId: session.trackId, chunks: sequence })
    } catch (error) {
      if (this.audioStreams.get(client.id) !== session) return

      this.audioStreams.delete(client.id)
      session.stream.destroy()
      client.emit('audioStreamError', {
        trackId: session.trackId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /** Runs the calculate current time operation. */
  private calculateCurrentTime(session: PlayingSession): number {
    const elapsed = (Date.now() - session.timestamp) / 1000
    return session.currentTime + elapsed
  }

  /** Runs the create ws context operation. */
  private createWsContext(client: AuthenticatedSocket) {
    const context = new ExecutionContextHost([client])
    context.setType('ws')
    return context
  }

  /** Runs the stop audio stream operation. */
  private stopAudioStream(socketId: string) {
    const session = this.audioStreams.get(socketId)
    if (!session) return false

    this.audioStreams.delete(socketId)
    session.stream.destroy()
    return true
  }

  /** Runs the stop user audio streams operation. */
  private stopUserAudioStreams(userId: string) {
    for (const socketId of this.userSessions.get(userId) ?? []) {
      this.stopAudioStream(socketId)
    }
  }

  /** Runs the emit to user operation. */
  emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
    this.server.to(`user_${userId}`).emit(event, data)
  }
}
