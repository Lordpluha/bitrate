import { describe, expect, it, vi } from 'vitest'
import { playableAudioUrl } from './audioSource'

const URL = 'http://api.test/api/v1/releases/r1/tracks/t1/audio'

function probeWith(...statuses: number[]) {
  const queue = [...statuses]
  return vi.fn(async () => new Response(null, { status: queue.shift() ?? 500 }))
}

describe('playableAudioUrl', () => {
  it('hands the master URL to the player when the session can read it', async () => {
    const probe = probeWith(206)
    const refresh = vi.fn(async () => true)

    await expect(playableAudioUrl(URL, { probe, refresh })).resolves.toBe(URL)
    // One byte is enough to prove access without streaming the whole master.
    expect(probe).toHaveBeenCalledWith(URL, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      credentials: 'include',
    })
    expect(refresh).not.toHaveBeenCalled()
  })

  it('renews an expired session once before handing the URL over', async () => {
    const probe = probeWith(401, 200)
    const refresh = vi.fn(async () => true)

    await expect(playableAudioUrl(URL, { probe, refresh })).resolves.toBe(URL)
    expect(refresh).toHaveBeenCalledOnce()
    expect(probe).toHaveBeenCalledTimes(2)
  })

  it('asks the artist to sign in again when the session cannot be renewed', async () => {
    const probe = probeWith(401)
    const refresh = vi.fn(async () => false)

    await expect(playableAudioUrl(URL, { probe, refresh })).rejects.toThrow(
      'Your session has expired. Sign in again to listen.',
    )
  })

  it('reports a master that is gone', async () => {
    await expect(
      playableAudioUrl(URL, { probe: probeWith(404), refresh: vi.fn() }),
    ).rejects.toThrow('This recording is no longer available.')
  })

  it.each([500, 403])(
    'reports a failed check (%i) as retryable',
    async (status) => {
      await expect(
        playableAudioUrl(URL, { probe: probeWith(status), refresh: vi.fn() }),
      ).rejects.toThrow('Could not load this recording. Try again.')
    },
  )

  it('reports a network failure as retryable', async () => {
    const probe = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })

    await expect(
      playableAudioUrl(URL, { probe, refresh: vi.fn() }),
    ).rejects.toThrow('Could not load this recording. Try again.')
  })
})
