import type { CmafFragment } from './cmaf'

export interface Mp4Box {
  type: string
  start: number
  end: number
  payload: number
}

export interface FragmentIndex {
  timescale: number
  initRange: [number, number]
  indexRange: [number, number]
  durationTicks: number
  fragments: CmafFragment[]
}

export function readBoxes(data: Uint8Array, start?: number, end?: number): Mp4Box[]

export function parseSidx(
  data: Uint8Array,
  box: Pick<Mp4Box, 'end' | 'payload'>,
): { timescale: number; fragments: CmafFragment[] }

export function buildFragmentIndex(data: Uint8Array): FragmentIndex

export function buildFragmentIndexFromFile(
  handle: {
    read(
      buffer: Uint8Array,
      offset: number,
      length: number,
      position: number,
    ): Promise<{ bytesRead: number }>
  },
  fileSize: number,
): Promise<FragmentIndex>

export function assertAlignedRenditions(
  renditions: { bitrate: number; index: FragmentIndex }[],
): void
