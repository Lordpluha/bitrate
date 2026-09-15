import type { Page, PageRequest } from '../shared/page'
import type { Track, TrackFilter } from './track'

export type ListTracksQuery = PageRequest & {
  filter: TrackFilter
}

/** The port the catalog screen talks to. See `ArtistRepository` for why this is a class. */
export abstract class TrackRepository {
  abstract list(query: ListTracksQuery): Promise<Page<Track>>
  abstract reprocess(id: string): Promise<void>
}
