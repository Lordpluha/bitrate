import { jest } from '@jest/globals'

export const parseFile = jest
  .fn<() => Promise<{ format: { duration: number; bitrate: number } }>>()
  .mockResolvedValue({
    format: { duration: 100, bitrate: 128000 },
  })
