import type { BatchResult, Page, PageRequest, TakeDownInput } from '../shared'
import type { ProcessingAttempt } from './processing-attempt'
import type { Track, TrackAudioSource, TrackDetail, TrackFilter } from './track'

export type ListTracksQuery = PageRequest & {
  filter: TrackFilter
}

export type ProbeTrackAudioInput = {
  id: string
  bitrate: number
}

/** The port the catalog screens talk to. See `ArtistRepository` for why this is a class. */
export abstract class TrackRepository {
  abstract list(query: ListTracksQuery): Promise<Page<Track>>
  abstract getById(id: string): Promise<TrackDetail>
  abstract reprocess(id: string): Promise<void>
  /** Soft-deletes (takes down) the track — the API also blocks new reprocess requests. */
  abstract takeDown(input: TakeDownInput): Promise<void>
  /** Takes every id down independently; a row that fails does not stop the others. */
  abstract takeDownMany(ids: readonly string[]): Promise<BatchResult>
  abstract restore(input: TakeDownInput): Promise<void>
  /** Newest first. Soft-deleted tracks are still reachable, matching `getById`. */
  abstract listProcessingAttempts(trackId: string, page: number): Promise<Page<ProcessingAttempt>>
  /**
   * Confirms the session is live and the rendition is playable before the component ever sets
   * `<audio src>` — issues the `HEAD` probe (so `HttpClient`'s auth interceptor can refresh an
   * expired access token first) and only then returns the URL to play.
   */
  abstract probeAudio(input: ProbeTrackAudioInput): Promise<TrackAudioSource>
}
