import { z } from 'zod'

/** Track lists ask for at most one page of rows at a time. */
export const MAX_ALBUM_LOOKUP_TRACKS = 100

/** `?trackIds=a,b,c`: one to 100 track ids, comma-separated. */
export const TrackIdsQuerySchema = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.uuid()).min(1).max(MAX_ALBUM_LOOKUP_TRACKS))
