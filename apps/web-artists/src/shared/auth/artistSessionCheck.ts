import { createArtistSessionCache } from './artistSessionCache'
import { getArtistSession } from './getArtistSession'

/** The dashboard guard's session check; sign-out must clear it. */
export const artistSessionCheck = createArtistSessionCache(() =>
  getArtistSession(),
)
