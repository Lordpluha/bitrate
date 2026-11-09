import { monotonePath, sampleMonotone } from '@shared/lib/chartPath'

export const LISTENING_PERIODS = [7, 28, 90] as const
export type ListeningPeriod = (typeof LISTENING_PERIODS)[number]

const TRACKS = [
  {
    id: 'night',
    title: 'Night Signal',
    cover: '/demo/music/album-night-signal.webp',
    plays: { 7: 1420, 28: 7280, 90: 22400 },
  },
  {
    id: 'echoes',
    title: 'Echoes in Motion',
    cover: '/demo/music/album-echoes-in-motion.webp',
    plays: { 7: 1880, 28: 6320, 90: 20600 },
  },
  {
    id: 'afterglow',
    title: 'Afterglow',
    cover: '/demo/music/album-afterglow.webp',
    plays: { 7: 980, 28: 4820, 90: 26800 },
  },
] as const

const WEEK = [410, 560, 490, 680, 620, 840, 680]
const MONTH = [
  260, 305, 285, 420, 330, 500, 450, 340, 430, 610, 570, 490, 650, 590, 570,
  760, 640, 780, 730, 900, 840, 790, 940, 860, 1040, 970, 1210, 1100,
]
const LISTENERS = { 7: 1480, 28: 5210, 90: 18020 } as const
const LAST_DAY = Date.UTC(2026, 10, 6)
const DAY_MS = 86_400_000

function makePreview(period: ListeningPeriod) {
  const tracks = TRACKS.map((track) => ({
    ...track,
    plays: track.plays[period],
  })).sort((a, b) => b.plays - a.plays)
  const plays = tracks.reduce((sum, track) => sum + track.plays, 0)
  const weights =
    period === 7
      ? WEEK
      : period === 28
        ? MONTH
        : Array.from(
            { length: 90 },
            (_, index) =>
              MONTH[index % MONTH.length] + 90 + Math.floor(index / 15) * 70,
          )
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const daily = weights.map((weight, index) => ({
    date: new Date(LAST_DAY - (period - 1 - index) * DAY_MS)
      .toISOString()
      .slice(0, 10),
    plays: Math.round((weight / total) * plays),
  }))
  daily[daily.length - 1].plays +=
    plays - daily.reduce((sum, day) => sum + day.plays, 0)
  const ceiling =
    Math.ceil(Math.max(...daily.map((day) => day.plays)) / 100) * 100
  // Equal point counts let all periods and the opening sound wave morph continuously.
  const curve = sampleMonotone(
    daily.map((day) => 1 - day.plays / ceiling),
    91,
  )
  return {
    period,
    tracks,
    plays,
    listeners: LISTENERS[period],
    daily,
    ceiling,
    curve,
  }
}

export const LISTENING_PREVIEWS = {
  7: makePreview(7),
  28: makePreview(28),
  90: makePreview(90),
}
export type ListeningPreview = (typeof LISTENING_PREVIEWS)[ListeningPeriod]

export const SOUND_CURVE = Array.from({ length: 91 }, (_, index) =>
  Number(
    (
      0.5 +
      Math.sin(index * 1.55) * 0.3 * Math.sin((index / 90) * Math.PI)
    ).toFixed(4),
  ),
)

/** Shared monotone interpolation keeps the preview consistent with workspace analytics. */
export function listeningPath(curve: readonly number[]) {
  return monotonePath(
    curve.map((value, index) => ({
      x: Number(((index / (curve.length - 1)) * 600).toFixed(3)),
      y: Number((value * 220).toFixed(3)),
    })),
  )
}
