import type { Genre, GenreSortField } from '@domain/genre'
import type { GenreDto, WireGenreSortField } from './genre.dto'

/**
 * Spelled out rather than returned as-is, so a sort field the API drops later is a compile error
 * here instead of a 400 an operator's click triggers.
 */
const TO_WIRE_SORT = {
  name: 'name',
  slug: 'slug',
  createdAt: 'createdAt',
} as const satisfies Record<GenreSortField, NonNullable<WireGenreSortField>>

export function toWireGenreSort(field: GenreSortField): NonNullable<WireGenreSortField> {
  return TO_WIRE_SORT[field]
}

export function toGenre(dto: GenreDto): Genre {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    description: dto.description,
    color: dto.color,
    counts: dto.counts,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  }
}
