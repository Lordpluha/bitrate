import type { Page, PageRequest, TakeDownInput } from '../shared'
import type { Album, AlbumDetail, AlbumFilter } from './album'

export type ListAlbumsQuery = PageRequest & {
  filter: AlbumFilter
}

/** The port the album screens talk to. See `ArtistRepository` for why this is a class. */
export abstract class AlbumRepository {
  abstract list(query: ListAlbumsQuery): Promise<Page<Album>>
  /** A taken-down album is still reachable, so the operator can review it before restoring. */
  abstract getById(id: string): Promise<AlbumDetail>
  /** Soft-deletes the album only; its tracks keep their own state. */
  abstract takeDown(input: TakeDownInput): Promise<void>
  abstract restore(input: TakeDownInput): Promise<void>
}
