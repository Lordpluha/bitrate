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
import type { Server } from 'socket.io'
import {
  playPayloadSchema,
  streamPayloadSchema,
  trackPayloadSchema,
  updatePayloadSchema,
} from './audio-gateway.schemas'
import type { AuthenticatedSocket, StreamTrackPayload } from './audio-gateway.types'
import { AudioSessionRegistry } from './audio-session.registry'
import type { PauseTrackDto, StartTrackDto, UpdateStreamingDto } from './dtos'
import { TrackStreamingService } from './track-streaming.service'
import * as TracksServiceModule from './tracks.service'

/** The payload one WebSocket handler contributes to its success response. */
type HandlerResult = Record<string, unknown>

/** Represents the audio gateway. */
@WebSocketGateway(websocketConfig)
@UseGuards(WsUserAuthGuard)
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /** The server value. */
  @WebSocketServer()
  server: Server

  /** The logger value. */
  private readonly logger = new Logger(AudioGateway.name, { timestamp: true })

  /** Connection, playback, and in-flight audio state for every live socket. */
  private readonly sessions = new AudioSessionRegistry()

  /** Creates a new instance. */
  constructor(
    @Inject(TracksServiceModule.TracksService)
    private tracksService: TracksServiceModule.TracksService,
    @Inject(TrackStreamingService) private trackStreamingService: TrackStreamingService,
    @Inject(WsUserAuthGuard) private wsAuthGuard: WsUserAuthGuard,
  ) {}

  /**
   * Runs one handler and wraps its result in the gateway's response envelope.
   *
   * Every message handler reports failure the same way, so the shape lives here
   * rather than being repeated in each `catch`.
   */
  private async respond(
    event: string,
    action: () => Promise<HandlerResult> | HandlerResult,
  ): Promise<WsResponse> {
    try {
      return { event, data: { success: true, ...(await action()) } }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error handling ${event}:`, message)
      return { event, data: { success: false, error: message } }
    }
  }

  /** Returns the socket's user id, refusing anonymous sockets. */
  private requireUserId(client: AuthenticatedSocket): string {
    if (!client.userId) throw new Error('Unauthorized')
    return client.userId
  }

  /** Broadcasts an event to every socket the user has open. */
  emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
    this.server.to(`user_${userId}`).emit(event, data)
  }

  /** Runs the create ws context operation. */
  private createWsContext(client: AuthenticatedSocket) {
    const context = new ExecutionContextHost([client])
    context.setType('ws')
    return context
  }

  /** Runs the handle connection operation. */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      await this.wsAuthGuard.canActivate(this.createWsContext(client))

      if (!client.userId) {
        this.logger.error('Invalid token payload - no user ID')
        client.disconnect()
        return
      }

      this.sessions.addSocket(client.userId, client.id)
      this.logger.log(`User ${client.userId} connected with socket ${client.id}`)

      Promise.resolve(client.join(`user_${client.userId}`)).catch((err: unknown) => {
        this.logger.error('Failed to join user room', err)
      })

      client.emit('trackState', this.sessions.getPlaybackState(client.userId))
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
    this.sessions.stopStream(client.id)
    if (!client.userId) return

    this.sessions.removeSocket(client.userId, client.id)
    this.logger.log(`User ${client.userId} disconnected`)
  }

  /** Runs the handle stream track operation. */
  @SubscribeMessage('streamTrack')
  async handleStreamTrack(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ): Promise<WsResponse> {
    return await this.respond('streamTrack', async () => {
      this.requireUserId(client)

      const parsed = streamPayloadSchema.safeParse(payload)
      if (!parsed.success) throw new Error('Invalid payload')

      return await this.startAudioStream(client, parsed.data)
    })
  }

  /** Runs the handle stop track stream operation. */
  @SubscribeMessage('stopTrackStream')
  handleStopTrackStream(@ConnectedSocket() client: AuthenticatedSocket): WsResponse {
    const stopped = this.sessions.stopStream(client.id)
    return { event: 'stopTrackStream', data: { success: true, stopped } }
  }

  /** Runs the handle play track operation. */
  @SubscribeMessage('playTrack')
  async handlePlayTrack(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: StartTrackDto,
  ): Promise<WsResponse> {
    return await this.respond('playTrack', async () => {
      const userId = this.requireUserId(client)

      const parsed = playPayloadSchema.safeParse(payload)
      if (!parsed.success) throw new Error('Invalid payload')

      const track = await this.tracksService.findTrackById(parsed.data.trackId)
      if (!track) throw new Error('Track not found')

      const { trackId, currentTime } = parsed.data
      const audio = await this.startAudioStream(client, parsed.data)
      this.sessions.startPlaying(userId, trackId, currentTime)

      this.emitToUser(userId, 'trackPlaying', {
        trackId,
        currentTime,
        bitrate: audio.bitrate,
        format: audio.format,
        userId,
      })

      return { trackId, currentTime, bitrate: audio.bitrate, format: audio.format }
    })
  }

  /** Runs the handle pause track operation. */
  @SubscribeMessage('pauseTrack')
  async handlePauseTrack(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: PauseTrackDto,
  ): Promise<WsResponse> {
    return await this.respond('pauseTrack', () => {
      const userId = this.requireUserId(client)

      const parsed = trackPayloadSchema.safeParse(payload)
      if (!parsed.success) throw new Error('Invalid payload')

      const { trackId, currentTime } = parsed.data
      this.sessions.stopPlaying(userId)
      this.emitToUser(userId, 'trackPaused', { trackId, currentTime, userId })

      return { trackId, currentTime }
    })
  }

  /** Runs the handle update streaming operation. */
  @SubscribeMessage('updateStreaming')
  async handleUpdateStreaming(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateStreamingDto,
  ): Promise<WsResponse> {
    return await this.respond('updateStreaming', async () => {
      const userId = this.requireUserId(client)

      const parsed = updatePayloadSchema.safeParse(payload)
      if (!parsed.success) throw new Error('Invalid payload')

      const { trackId, currentTime, isPlaying } = parsed.data
      if (isPlaying) {
        const track = await this.tracksService.findTrackById(trackId)
        if (!track) throw new Error('Track not found')
        this.sessions.startPlaying(userId, trackId, currentTime)
      } else {
        this.sessions.stopPlaying(userId)
      }

      this.emitToUser(userId, 'trackUpdated', { trackId, currentTime, isPlaying, userId })

      return { trackId, currentTime, isPlaying }
    })
  }

  /** Runs the handle get current state operation. */
  @SubscribeMessage('getCurrentState')
  handleGetCurrentState(@ConnectedSocket() client: AuthenticatedSocket): WsResponse {
    if (!client.userId) {
      return { event: 'currentState', data: { error: 'Unauthorized' } }
    }

    return { event: 'currentState', data: this.sessions.getPlaybackState(client.userId) }
  }

  /** Opens an audio stream for the requested quality and starts pushing it. */
  private async startAudioStream(client: AuthenticatedSocket, payload: StreamTrackPayload) {
    const audio = await this.trackStreamingService.getTrackAudioStream(
      payload.trackId,
      payload.bitrate,
      payload.format,
    )

    const session = { stream: audio.stream, trackId: audio.trackId }
    this.sessions.openStream(client.id, session)

    client.emit('audioStreamStarted', {
      trackId: audio.trackId,
      bitrate: audio.bitrate,
      format: audio.format,
      codec: audio.codec,
      contentType: audio.contentType,
      size: audio.size,
    })

    void this.sessions.pipeToSocket(client, session)

    return { trackId: audio.trackId, bitrate: audio.bitrate, format: audio.format }
  }
}
