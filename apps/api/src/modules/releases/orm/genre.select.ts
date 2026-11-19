import type { Prisma } from '@prisma/client'

/** What artists see of a catalogue genre when they tag recordings. */
export const GENRE_OPTION_SELECT = {
  id: true,
  slug: true,
  name: true,
} as const satisfies Prisma.GenreSelect

/** A recording's chosen genres, alphabetical so every response lists them the same way. */
export const RECORDING_GENRES_SELECT = {
  select: { genre: { select: GENRE_OPTION_SELECT } },
  orderBy: { genre: { name: 'asc' } },
} as const satisfies Prisma.ArtistTrackDraft$genresArgs
