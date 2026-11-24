// Demo catalogue for the workspace pages: one artist's releases and tracks (titles of the demo music
// the apps ship), cover art from the player library's album assets, statuses from labels.ts.

const ART = '../../web-player-design/design-system/assets/albums/'

/** A cover image fill for a `Cover` instance. */
export const coverFill = (file) => ({
  fill: { type: 'image', url: `${ART}album-${file}.webp`, mode: 'cover' },
})

/* [title, cover, type, status chip tone, status label, tracks, release date, updated] */
export const RELEASES = [
  [
    'Night Signal',
    'night-signal',
    'Single',
    'Neutral',
    'Draft',
    '1 track',
    'Nov 14, 2026',
    'Today',
  ],
  [
    'Echoes in Motion',
    'echoes-in-motion',
    'EP',
    'Processing',
    'Submitted',
    '5 tracks',
    'Dec 5, 2026',
    'Yesterday',
  ],
  [
    'Afterglow',
    'afterglow',
    'Album',
    'Ready',
    'Released',
    '9 tracks',
    'Oct 3, 2026',
    'Oct 3, 2026',
  ],
  [
    'Static Lines',
    'static-lines',
    'Single',
    'Ready',
    'Scheduled',
    '1 track',
    'Nov 28, 2026',
    '2 days ago',
  ],
]

/* [title, cover, version · duration, tone, status, updated, release] */
export const TRACKS = [
  [
    'Night Signal',
    'night-signal',
    'Original · 3:42',
    'Processing',
    'Processing',
    'Today',
    'Night Signal',
  ],
  [
    'Echoes in Motion',
    'echoes-in-motion',
    'Original · 4:05',
    'Ready',
    'Ready',
    'Yesterday',
    'Echoes in Motion',
  ],
  [
    'Low Tide',
    'echoes-in-motion',
    'Original · 3:18',
    'Ready',
    'Ready',
    'Yesterday',
    'Echoes in Motion',
  ],
  ['Afterglow', 'afterglow', 'Remaster · 3:57', 'Ready', 'Published', 'Oct 3, 2026', 'Afterglow'],
  [
    'Drift Control',
    'drift-control',
    'Demo · 2:49',
    'Error',
    'Needs changes',
    '2 days ago',
    'Unreleased',
  ],
  [
    'Static Lines',
    'static-lines',
    'Live · 5:11',
    'Neutral',
    'Draft',
    'Nov 2, 2026',
    'Static Lines',
  ],
]
