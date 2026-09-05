import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchWithAuthRefresh } = vi.hoisted(() => ({
  fetchWithAuthRefresh: vi.fn(),
}))

vi.mock('@shared/api/client', () => ({ fetchWithAuthRefresh }))

import { fetchRenditionRange } from './hooks'

const fetchRange = () =>
  fetchRenditionRange({
    bitrate: 128,
    expectedSize: 10,
    range: [2, 4],
    signal: new AbortController().signal,
    trackId: 'track-id',
  })

const response = (
  status: number,
  bytes: number[],
  contentRange: string | null = 'bytes 2-4/10',
) =>
  new Response(new Uint8Array(bytes), {
    headers: contentRange
      ? {
          'Content-Length': String(bytes.length),
          'Content-Range': contentRange,
        }
      : undefined,
    status,
  })

describe('fetchRenditionRange', () => {
  beforeEach(() => {
    fetchWithAuthRefresh.mockReset()
  })

  it('accepts an exact partial response', async () => {
    fetchWithAuthRefresh.mockResolvedValue(response(206, [1, 2, 3]))

    await expect(fetchRange()).resolves.toHaveProperty('byteLength', 3)
  })

  it('rejects a server that ignores Range and returns the whole file', async () => {
    fetchWithAuthRefresh.mockResolvedValue(response(200, [1, 2, 3]))

    await expect(fetchRange()).rejects.toMatchObject({ status: 200 })
  })

  it('rejects an unsatisfied range explicitly', async () => {
    fetchWithAuthRefresh.mockResolvedValue(response(416, [], null))

    await expect(fetchRange()).rejects.toMatchObject({ status: 416 })
  })

  it('rejects a mismatched Content-Range', async () => {
    fetchWithAuthRefresh.mockResolvedValue(
      response(206, [1, 2, 3], 'bytes 1-3/10'),
    )

    await expect(fetchRange()).rejects.toThrow(/Content-Range/)
  })

  it('rejects a Content-Range total that disagrees with the manifest', async () => {
    fetchWithAuthRefresh.mockResolvedValue(
      response(206, [1, 2, 3], 'bytes 2-4/11'),
    )

    await expect(fetchRange()).rejects.toThrow(/Content-Range/)
  })

  it('rejects a truncated body', async () => {
    const truncated = response(206, [1, 2])
    truncated.headers.delete('Content-Length')
    fetchWithAuthRefresh.mockResolvedValue(truncated)

    await expect(fetchRange()).rejects.toThrow(/unexpected length/)
  })
})
