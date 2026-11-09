import type { ArtistEntity } from '@entities/Artist'
import type { Friend } from '@entities/Friend'
import type { ListeningHistoryEntry } from '@entities/History'
import type { TrackEntity } from '@entities/Track'
import type { FollowingActivityEntry } from '@entities/User'

/**
 * The landing's demo library: the same people, artists and tracks as the screenshot stand-in
 * API (`tests/screenshot/mock-api.mjs`), so the real player blocks render realistic content.
 * Every image is a local `/images/…` file — a demo block never asks the API for media.
 */

/** A moment shortly before the visit, so relative times read naturally ("2 min ago"). */
const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString()

const COVERS = [
  '/images/auth/night-signal.webp',
  '/images/default-playlist.jpg',
  '/images/auth/bitrate-mark.webp',
] as const

const AVATARS = [
  '/images/avatars/avatar1.jpg',
  '/images/avatars/avatar2.jpg',
  '/images/avatars/avatar3.jpg',
  '/images/avatars/avatar4.jpg',
] as const

const pick = <T>(list: readonly T[], index: number): T =>
  list[index % list.length] as T

/** Artists of the demo library. */
export const DEMO_ARTISTS: readonly ArtistEntity[] = [
  ['ar1', 'Luma Vale'],
  ['ar2', 'Mira Sol'],
  ['ar3', 'Northbound'],
  ['ar4', 'Drift'],
  ['ar5', 'Kite Theory'],
  ['ar6', 'Ana Ross'],
].map(([id = '', username = ''], index) => ({
  avatar: pick(AVATARS, index),
  backgroundImage: null,
  bio: `${username} makes late-night synth pop with warm analogue textures.`,
  id,
  monthlyListeners: 182_000 - index * 21_000,
  username,
  verified: index % 2 === 0,
}))

const TRACK_TITLES = [
  'Night Signal',
  'Afterglow',
  'Rain Drive',
  'Glass Coast',
  'Static Bloom',
  'Low Tide',
  'Paper Moons',
  'Neon Hours',
] as const

/** Tracks of the demo library; none has audio, so nothing can ever stream. */
export const DEMO_TRACK_LIST: readonly TrackEntity[] = TRACK_TITLES.map(
  (title, index) => {
    const artist = pick(DEMO_ARTISTS, index)
    return {
      artistId: artist.id,
      audioUrl: '',
      cover: pick(COVERS, index),
      createdAt: minutesAgo(60 * 24 * (20 + index)),
      deletedAt: null,
      discNumber: 1,
      duration: 182 + index * 17,
      durationTicks: null,
      explicit: false,
      fragmentTimescale: null,
      id: `demo-t${index + 1}`,
      isrc: null,
      language: 'en',
      lyrics: null,
      playCount: 9_800_000 - index * 700_000,
      popularity: 90 - index * 5,
      previewUrl: null,
      processingAttempts: 1,
      processingError: null,
      processingFinishedAt: null,
      processingStartedAt: null,
      processingStatus: 'READY',
      publishedAt: minutesAgo(60 * 24 * (120 + index * 30)),
      releaseDate: minutesAgo(60 * 24 * (120 + index * 30)),
      title,
      trackNumber: index + 1,
      updatedAt: minutesAgo(60 * 24 * 10),
    }
  },
)

/** A demo track by position; the list is fixed, so the position always exists. */
export const demoTrack = (index: number): TrackEntity =>
  pick(DEMO_TRACK_LIST, index)

/** The signed-in listener the demo blocks act as. */
export const DEMO_ME = {
  avatar: pick(AVATARS, 0),
  createdAt: minutesAgo(60 * 24 * 365),
  description: 'Synth pop, late trains and long walks.',
  email: 'maya@example.com',
  emailVerifiedAt: minutesAgo(60 * 24 * 365),
  id: 'demo-u1',
  legalAcceptanceRequired: false,
  twoFactorEnabled: false,
  updatedAt: minutesAgo(60 * 24),
  username: 'Maya',
}

const PEOPLE = [
  ['f1', 'Maya Rivers'],
  ['f2', 'Jonah Pike'],
  ['f3', 'Ana Sol'],
  ['f4', 'Theo Lark'],
  ['f5', 'Iris Hale'],
  ['f6', 'Remy Cole'],
].map(([id = '', username = ''], index) => ({
  avatar: pick(AVATARS, index),
  id,
  username,
}))

const person = (index: number) => pick(PEOPLE, index)

type PresencePlan = readonly [
  person: number,
  status: Friend['presence']['status'],
  lastActiveMinutes: number,
  playing: number | null,
]

/** Friends with presence: listening first, then online, away, offline. */
const FRIEND_PLAN: readonly PresencePlan[] = [
  [0, 'online', 0.2, 1],
  [2, 'online', 0.5, 4],
  [1, 'online', 1, null],
  [3, 'away', 12, null],
  [4, 'offline', 120, null],
  [5, 'offline', 60 * 25, null],
]

export const DEMO_FRIENDS: readonly Friend[] = FRIEND_PLAN.map(
  ([index, status, lastActive, playing], order) => {
    const track = playing === null ? null : demoTrack(playing)
    return {
      friendsSince: new Date(minutesAgo(60 * 24 * (90 - order * 10))),
      presence: {
        lastActiveAt: new Date(minutesAgo(lastActive)),
        nowPlaying: track && {
          artist: {
            id: track.artistId,
            username: pick(DEMO_ARTISTS, playing ?? 0).username,
          },
          cover: track.cover,
          id: track.id,
          title: track.title,
        },
        status,
      },
      user: person(index),
    }
  },
)

/** What the people you follow played last. */
export const DEMO_ACTIVITY: readonly FollowingActivityEntry[] = [
  2,
  12,
  75,
  180,
  60 * 26,
].map((minutes, index) => {
  const track = demoTrack(index + 2)
  return {
    listenedAt: new Date(minutesAgo(minutes)),
    track: {
      artist: { username: pick(DEMO_ARTISTS, index + 2).username },
      artistId: track.artistId,
      cover: track.cover,
      id: track.id,
      title: track.title,
    },
    user: person(index),
  }
})

/** Recents: today first, then yesterday. */
export const DEMO_HISTORY: readonly ListeningHistoryEntry[] = [
  30,
  70,
  140,
  60 * 24 + 60,
  60 * 24 + 180,
].map((minutes, index) => {
  const track = demoTrack(index)
  return {
    id: `demo-h${index}`,
    listenedAt: minutesAgo(minutes),
    track: {
      artist: {
        avatar: null,
        id: track.artistId,
        username: pick(DEMO_ARTISTS, index).username,
      },
      artistId: track.artistId,
      cover: track.cover ?? pick(COVERS, index),
      duration: track.duration,
      id: track.id,
      title: track.title,
    },
    trackId: track.id,
  }
})

/** The listener's own playlists, as `GET /playlists/me` lists them. */
export const DEMO_PLAYLISTS = [
  ['demo-p1', 'Night Drive', 6],
  ['demo-p2', 'Focus Frequency', 5],
  ['demo-p3', 'Rain Days', 3],
  ['demo-p4', 'Morning Run', 8],
].map(([id, title, count], index) => ({
  _count: { tracks: Number(count) },
  cover: pick(COVERS, index + 1),
  createdAt: minutesAgo(60 * 24 * (50 - index * 10)),
  description: 'Songs for the drive home.',
  id: String(id),
  isPublic: true,
  title: String(title),
  updatedAt: minutesAgo(60 * 24 * 3),
  user: { avatar: null, id: DEMO_ME.id, username: DEMO_ME.username },
  userId: DEMO_ME.id,
}))

/** Search's browse categories. */
export const DEMO_CATEGORIES = [
  ['pop', 'Pop', '#7c3aed'],
  ['electronic', 'Electronic', '#0e7490'],
  ['hip-hop', 'Hip-hop', '#b45309'],
  ['ambient', 'Ambient', '#15803d'],
  ['rock', 'Rock', '#b91c1c'],
  ['focus', 'Focus', '#1d4ed8'],
  ['jazz', 'Jazz', '#a21caf'],
  ['chill', 'Chill', '#0f766e'],
  ['indie', 'Indie', '#be185d'],
  ['soul', 'Soul', '#4d7c0f'],
].map(([slug = '', name = '', color = '']) => ({
  _count: { albums: 12, artists: 40, tracks: 320 },
  color,
  cover: null,
  description: null,
  id: `demo-c-${slug}`,
  name,
  slug,
}))
