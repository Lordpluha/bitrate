import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { DownloadResourcesService } from './download-resources.service'

/** The NCS song shape, taken from the service so the spec needs no built `@bitrate/ncs-parser`. */
type Song = Parameters<DownloadResourcesService['downloadTrackResources']>[0]

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
const MP3 = Buffer.from('ID3-audio-bytes')

const song = (overrides: Partial<Song> = {}): Song =>
  ({
    id: '42',
    name: 'My Song!',
    coverUrl: 'https://cdn.example/cover.png',
    previewUrl: undefined,
    download: { regular: 'https://cdn.example/a.mp3', instrumental: undefined },
    ...overrides,
  }) as unknown as Song

const respond = (body: Buffer) =>
  ({ ok: true, status: 200, arrayBuffer: async () => body }) as unknown as Response

describe('DownloadResourcesService', () => {
  let dir: string
  let fetchMock: jest.SpiedFunction<typeof fetch>

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'seed-test-'))
    fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation((async (url: unknown) =>
        respond(String(url).endsWith('.png') ? PNG : MP3)) as typeof fetch)
  })

  afterEach(async () => {
    fetchMock.mockRestore()
    await rm(dir, { recursive: true, force: true })
  })

  it('keeps the cover in memory and writes only the audio, into the private working directory', async () => {
    const service = new DownloadResourcesService(dir)

    const result = await service.downloadTrackResources(song())

    expect(result.coverBuffer).toEqual(PNG)
    expect(result.audioFilePath).toBe(join(dir, 'my_song__42.mp3'))
    expect(await readFile(result.audioFilePath as string)).toEqual(MP3)
    expect(await readdir(dir)).toEqual(['my_song__42.mp3'])
  })

  it('reports no cover when the cover download fails', async () => {
    fetchMock.mockImplementation((async (url: unknown) =>
      String(url).endsWith('.png')
        ? ({ ok: false, status: 404 } as unknown as Response)
        : respond(MP3)) as typeof fetch)

    const result = await new DownloadResourcesService(dir).downloadTrackResources(song())

    expect(result.coverBuffer).toBeNull()
    expect(result.audioFilePath).not.toBeNull()
  })
})
