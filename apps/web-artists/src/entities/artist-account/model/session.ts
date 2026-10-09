import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

const instant = z.iso.datetime({ offset: true })

export const artistSessionSchema = z.object({
  id: z.uuid(),
  userAgent: z.string().nullable(),
  createdAt: instant,
  lastUsedAt: instant.nullable(),
  expiresAt: instant,
  current: z.boolean(),
}) satisfies z.ZodType<ApiSchemas['ArtistSessionDeviceEntity']>

export type ArtistSession = z.infer<typeof artistSessionSchema>

/** First match wins, so Edge and Opera are named before the Chrome engine they report. */
const BROWSERS: readonly [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
]

const SYSTEMS: readonly [RegExp, string][] = [
  [/Android/, 'Android'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Windows/, 'Windows'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/CrOS/, 'ChromeOS'],
  [/Linux/, 'Linux'],
]

/** A readable device name from the user agent; unknown agents fall back to plain wording. */
export function describeSessionDevice(userAgent: string | null): string {
  if (!userAgent) return 'Unknown device'
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1]
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1]
  if (browser && system) return `${browser} on ${system}`
  return browser ?? system ?? 'Unknown browser'
}
