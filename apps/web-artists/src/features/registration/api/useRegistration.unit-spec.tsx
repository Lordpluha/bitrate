import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useRegistration } from './useRegistration'

/** The API client captures `fetch` when it is created, so the stub goes in before it loads. */
const fetchMock = vi.hoisted(() => {
  const mock = vi.fn<typeof fetch>()
  globalThis.fetch = mock
  return mock
})

fetchMock.mockImplementation(
  async () =>
    new Response(JSON.stringify({ id: 'artist-1' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }),
)

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

const signUp = {
  acceptArtistAgreement: true,
  acceptLegal: true,
  email: 'artist@bitrate.me',
  password: 'correct-horse-7',
}

afterEach(() => {
  fetchMock.mockClear()
})

describe('useRegistration', () => {
  it.each([
    ['the Terms, Privacy Policy and age confirmation', { acceptLegal: false }],
    ['the Artist Agreement', { acceptArtistAgreement: false }],
  ])(
    'refuses to sign up without %s, and sends nothing',
    async (_label, missing) => {
      const { result } = renderHook(() => useRegistration(), { wrapper })

      result.current.mutate({ ...signUp, ...missing })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it('sends the acceptances the artist gave', async () => {
    const { result } = renderHook(() => useRegistration(), { wrapper })

    result.current.mutate(signUp)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const request = fetchMock.mock.calls[0]?.[0] as Request
    expect(await request.json()).toMatchObject({
      acceptArtistAgreement: true,
      acceptLegal: true,
      email: 'artist@bitrate.me',
    })
  })
})
