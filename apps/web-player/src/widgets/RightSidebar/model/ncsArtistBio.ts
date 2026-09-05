const NCS_BIO_PREFIX = 'Artist imported from NoCopyrightSounds:'
const NCS_HOSTNAME = 'ncs.io'
const NCS_ORIGIN = `https://${NCS_HOSTNAME}`
const NCS_ARTIST_PATH_PATTERN =
  /^\/artist\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/

export type NcsArtistBioLink = {
  href: string
  path: string
}

export const getNcsArtistBioPrefix = () => NCS_BIO_PREFIX

export const parseNcsArtistBioLink = (bio: string): NcsArtistBioLink | null => {
  const normalizedBio = bio.trim()
  const prefix = `${NCS_BIO_PREFIX} `

  if (!normalizedBio.startsWith(prefix)) return null

  const path = normalizedBio.slice(prefix.length)
  if (!NCS_ARTIST_PATH_PATTERN.test(path)) return null

  try {
    const url = new URL(path, NCS_ORIGIN)
    const isTrustedUrl =
      url.protocol === 'https:' &&
      url.hostname === NCS_HOSTNAME &&
      url.origin === NCS_ORIGIN &&
      url.pathname === path &&
      !url.search &&
      !url.hash

    return isTrustedUrl ? { href: url.toString(), path } : null
  } catch {
    return null
  }
}
