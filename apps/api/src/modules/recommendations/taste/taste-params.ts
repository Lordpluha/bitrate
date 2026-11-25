import type { NotInterestedType, TasteExclusionType } from '@prisma/client'

/** `/me/taste/not-interested/{kind}/{id}`: the URL segment for each kind of hidden item. */
export const NOT_INTERESTED_KINDS = {
  tracks: 'TRACK',
  artists: 'ARTIST',
} as const satisfies Record<string, NotInterestedType>

/** `/me/taste/exclusions/{kind}/{id}`: the URL segment for each kind of excluded item. */
export const TASTE_EXCLUSION_KINDS = {
  playlists: 'PLAYLIST',
  albums: 'ALBUM',
  tracks: 'TRACK',
} as const satisfies Record<string, TasteExclusionType>
