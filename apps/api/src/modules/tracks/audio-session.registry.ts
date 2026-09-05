import { Logger } from '@nestjs/common'
import type { AudioStreamSession, AuthenticatedSocket, PlayingSession } from './audio-gateway.types'

/** A client that never acknowledges a chunk must not hold a stream open forever. */
const AUDIO_CHUNK_ACK_TIMEOUT_MS = 10_000

const logger = new Logger('AudioSessionRegistry', { timestamp: true })

/** What one user is playing, as reported to a freshly connected socket. */
export type PlaybackState =
  | { trackId: string; currentTime: number; isPlaying: true }
  | { isPlaying: false }

/**
 * In-memory registry of who is connected, what they are playing, and which
 * audio bodies are mid-flight.
 *
 * The gateway owns the socket protocol; this owns the state behind it, so the
 * handlers stay thin and the bookkeeping is testable on its own.
 */
export class AudioSessionRegistry {
  /** userId -> socketIds */
  private readonly userSockets = new Map<string, Set<string>>()
  /** userId -> playing track info */
  private readonly playing = new Map<string, PlayingSession>()
  /** socketId -> active audio stream */
  private readonly streams = new Map<string, AudioStreamSession>()

  /** Registers a socket for a user. */
  addSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId) ?? new Set<string>()
    sockets.add(socketId)
    this.userSockets.set(userId, sockets)
  }

  /**
   * Drops a socket, clearing the user's playback state once their last one goes.
   *
   * @returns whether that was the user's last socket.
   */
  removeSocket(userId: string, socketId: string): boolean {
    const sockets = this.userSockets.get(userId)
    sockets?.delete(socketId)

    if (sockets && sockets.size > 0) return false

    this.userSockets.delete(userId)
    this.playing.delete(userId)
    return true
  }

  /** Records that a user started playing a track at `currentTime`. */
  startPlaying(userId: string, trackId: string, currentTime: number): void {
    this.playing.set(userId, { trackId, currentTime, timestamp: Date.now() })
  }

  /** Clears a user's playback state and tears down every stream they hold. */
  stopPlaying(userId: string): void {
    this.playing.delete(userId)
    for (const socketId of this.userSockets.get(userId) ?? []) this.stopStream(socketId)
  }

  /** Returns the user's playback position, advanced by the time since it was reported. */
  getPlaybackState(userId: string): PlaybackState {
    const session = this.playing.get(userId)
    if (!session) return { isPlaying: false }

    const elapsedSeconds = (Date.now() - session.timestamp) / 1000
    return {
      trackId: session.trackId,
      currentTime: session.currentTime + elapsedSeconds,
      isPlaying: true,
    }
  }

  /** Replaces any stream on this socket with a new one. */
  openStream(socketId: string, session: AudioStreamSession): void {
    this.stopStream(socketId)
    this.streams.set(socketId, session)
  }

  /**
   * Destroys the stream held by a socket.
   *
   * @returns whether there was one to stop.
   */
  stopStream(socketId: string): boolean {
    const session = this.streams.get(socketId)
    if (!session) return false

    this.streams.delete(socketId)
    session.stream.destroy()
    return true
  }

  /**
   * Pushes an audio body to a socket, chunk by chunk, waiting for each ack.
   *
   * Every step re-checks that this session still owns the socket: a client that
   * starts a new track mid-transfer must not receive the old track's chunks.
   */
  async pipeToSocket(client: AuthenticatedSocket, session: AudioStreamSession): Promise<void> {
    let sequence = 0
    const isCurrent = () => this.streams.get(client.id) === session

    try {
      for await (const chunk of session.stream) {
        if (!isCurrent()) return

        await client.timeout(AUDIO_CHUNK_ACK_TIMEOUT_MS).emitWithAck('audioChunk', {
          trackId: session.trackId,
          sequence,
          chunk: Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
        })
        sequence += 1
      }

      if (!isCurrent()) return
      this.streams.delete(client.id)
      client.emit('audioStreamEnded', { trackId: session.trackId, chunks: sequence })
    } catch (error) {
      if (!isCurrent()) return

      this.streams.delete(client.id)
      session.stream.destroy()
      logger.warn(`Audio stream for track ${session.trackId} ended early`)
      client.emit('audioStreamError', {
        trackId: session.trackId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
