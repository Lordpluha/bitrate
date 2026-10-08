import type { ApiSchemas } from '@bitrate/contracts'

export type ArtistIdentity = Pick<
  ApiSchemas['SafeArtistEntity'],
  'id' | 'username' | 'avatar'
>

interface AuthenticatedArtistSession {
  status: 'authenticated'
  artist: ArtistIdentity
}

interface UnauthenticatedArtistSession {
  status: 'unauthenticated'
}

interface UnavailableArtistSession {
  status: 'unavailable'
}

export type ArtistSessionResult =
  | AuthenticatedArtistSession
  | UnauthenticatedArtistSession
  | UnavailableArtistSession

export interface ArtistSessionRequest {
  apiUrl: string
  accessCookieName: string
  refreshCookieName: string
  accessToken?: string
  refreshToken?: string
}

export type ForwardSessionCookies = (cookies: string[]) => void
