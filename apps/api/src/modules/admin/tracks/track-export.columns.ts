/** The CSV export's columns, in header order — `artistUsername` is joined from the artist. */
export const ADMIN_TRACK_EXPORT_COLUMNS = [
  'id',
  'title',
  'artistId',
  'artistUsername',
  'processingStatus',
  'processingError',
  'processingAttempts',
  'processingFinishedAt',
  'deletedAt',
  'createdAt',
] as const
