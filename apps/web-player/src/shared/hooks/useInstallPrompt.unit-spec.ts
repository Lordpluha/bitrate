import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useInstallPrompt } from './useInstallPrompt'

const fireInstallPrompt = ({
  outcome,
}: {
  outcome: 'accepted' | 'dismissed'
}) => {
  const prompt = vi.fn(async () => undefined)
  const event = Object.assign(
    new Event('beforeinstallprompt', { cancelable: true }),
    {
      prompt,
      userChoice: Promise.resolve({ outcome, platform: 'web' }),
    },
  )
  act(() => {
    window.dispatchEvent(event)
  })
  return { event, prompt }
}

describe('useInstallPrompt', () => {
  it('is not installable until the browser offers an install prompt', () => {
    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.canInstall).toBe(false)

    const { event } = fireInstallPrompt({ outcome: 'dismissed' })

    expect(event.defaultPrevented).toBe(true)
    expect(result.current.canInstall).toBe(true)
  })

  it('shows the browser prompt and stops offering it once accepted', async () => {
    const { result } = renderHook(() => useInstallPrompt())
    const { prompt } = fireInstallPrompt({ outcome: 'accepted' })

    await act(async () => {
      await result.current.install()
    })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(result.current.canInstall).toBe(false)
  })

  it('stops offering the install once the app is installed', () => {
    const { result } = renderHook(() => useInstallPrompt())
    fireInstallPrompt({ outcome: 'dismissed' })

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.canInstall).toBe(false)
  })
})
