import type { Page, PageRequest } from '../shared'
import type { Genre, GenreFilter } from './genre'

export type ListGenresQuery = PageRequest & {
  filter: GenreFilter
}

export type CreateGenreInput = {
  name: string
  /** Derived by the API from the name when omitted. */
  slug?: string
  description?: string | null
  color?: string | null
}

export type UpdateGenreInput = {
  id: string
  name?: string
  slug?: string
  description?: string | null
  color?: string | null
}

/** The port the genre screens talk to. */
export abstract class GenreRepository {
  abstract list(query: ListGenresQuery): Promise<Page<Genre>>
  abstract get(id: string): Promise<Genre>
  abstract create(input: CreateGenreInput): Promise<Genre>
  abstract update(input: UpdateGenreInput): Promise<Genre>
  /** Physical delete; refused with `GenreWriteError('in-use')` while the genre is referenced. */
  abstract delete(id: string): Promise<void>
}
