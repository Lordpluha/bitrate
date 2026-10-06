import type { Page, PageRequest, TakeDownInput } from '../shared'
import type { Playlist, PlaylistDetail, PlaylistFilter } from './playlist'

export type ListPlaylistsQuery = PageRequest & {
  filter: PlaylistFilter
}

/** Hides (`isPublic: false`) or un-hides (`isPublic: true`) a playlist. */
export type SetPlaylistVisibilityInput = {
  id: string
  isPublic: boolean
  reason?: string
}

/** The port the playlist screens talk to. See `ArtistRepository` for why this is a class. */
export abstract class PlaylistRepository {
  abstract list(query: ListPlaylistsQuery): Promise<Page<Playlist>>
  /** A hidden or taken-down playlist is still reachable, so the operator can review and reverse it. */
  abstract getById(id: string): Promise<PlaylistDetail>
  /** Changes visibility only; the take-down state is untouched. */
  abstract setVisibility(input: SetPlaylistVisibilityInput): Promise<void>
  /** Soft-deletes the playlist only; its visibility is untouched. */
  abstract takeDown(input: TakeDownInput): Promise<void>
  abstract restore(input: TakeDownInput): Promise<void>
}
