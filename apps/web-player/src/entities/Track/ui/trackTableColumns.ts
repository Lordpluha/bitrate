/**
 * The design system's Track Table columns, shared by the header and every row so they stay in
 * line: a 42px number cell, the title, Album 260, Date added 130 and the 90px duration column
 * (wider only when a row carries extra hover actions). Compact view adds a 180px artist column.
 */
export const TRACK_TABLE_COLUMNS = {
  compact:
    'grid-cols-[42px_minmax(0,1fr)_minmax(0,180px)_minmax(0,220px)_minmax(0,130px)_minmax(90px,auto)]',
  list: 'grid-cols-[42px_minmax(0,1fr)_minmax(0,260px)_minmax(0,130px)_minmax(90px,auto)]',
} as const
