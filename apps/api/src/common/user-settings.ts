import type { PrismaService } from '@infra/prisma/prisma.service'

/** Settings a user has before saving any; the row is created lazily on first read or write. */
export const USER_SETTINGS_DEFAULTS = {
  language: 'en',
  streamingQuality: 'automatic',
  normalizeVolume: true,
  compactLibrary: false,
  showNowPlaying: true,
  autoplay: true,
  explicitContent: true,
  privateSession: false,
  showListeningActivity: true,
  followersVisible: true,
  publicPlaylistsOnProfile: true,
} as const

/** The settings that change what the server shows or records. */
const EFFECTIVE_SELECT = {
  explicitContent: true,
  privateSession: true,
  showListeningActivity: true,
  followersVisible: true,
  publicPlaylistsOnProfile: true,
} as const

/** Values of the settings in `EFFECTIVE_SELECT`. */
export type EffectiveSettings = {
  explicitContent: boolean
  privateSession: boolean
  showListeningActivity: boolean
  followersVisible: boolean
  publicPlaylistsOnProfile: boolean
}

const EFFECTIVE_DEFAULTS: EffectiveSettings = {
  explicitContent: USER_SETTINGS_DEFAULTS.explicitContent,
  privateSession: USER_SETTINGS_DEFAULTS.privateSession,
  showListeningActivity: USER_SETTINGS_DEFAULTS.showListeningActivity,
  followersVisible: USER_SETTINGS_DEFAULTS.followersVisible,
  publicPlaylistsOnProfile: USER_SETTINGS_DEFAULTS.publicPlaylistsOnProfile,
}

/** One user's server-relevant settings, with the defaults when they never saved any. */
export const readUserSettings = async (
  prisma: PrismaService,
  userId: string,
): Promise<EffectiveSettings> =>
  (await prisma.userSettings.findUnique({ where: { userId }, select: EFFECTIVE_SELECT })) ??
  EFFECTIVE_DEFAULTS
