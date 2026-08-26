import type { Readable } from 'node:stream'
import type { Socket } from 'socket.io'

/** A socket the WebSocket auth guard has already attached a user to. */
export interface AuthenticatedSocket extends Socket {
  /** The user id value. */
  userId?: string
}

/** What one user is currently playing, and when that position was reported. */
export interface PlayingSession {
  /** The track id value. */
  trackId: string
  /** The current time value. */
  currentTime: number
  /** The timestamp value. */
  timestamp: number
}

/** An audio body being pushed to one socket. */
export interface AudioStreamSession {
  /** The stream value. */
  stream: Readable
  /** The track id value. */
  trackId: string
}

/** The quality a client asked for when opening an audio stream. */
export interface StreamTrackPayload {
  /** The track id value. */
  trackId: string
  /** The bitrate value. */
  bitrate?: number
  /** The format value. */
  format?: string
}
