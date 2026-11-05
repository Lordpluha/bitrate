import { jest } from '@jest/globals'

/*
 * Mapped over `music-metadata` in jest-unit/jest-int `moduleNameMapper`: the package is ESM-only
 * (no `"require"` export condition), so ts-jest cannot load anything that reaches `track-media.ts`.
 */

/** The parse file value. */
export const parseFile = jest
  .fn<() => Promise<{ format: { duration: number; bitrate: number } }>>()
  .mockResolvedValue({
    format: { duration: 100, bitrate: 128000 },
  })
