import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { GET } = vi.hoisted(() => ({ GET: vi.fn() }))

vi.mock('@shared/api/client', () => ({
  clientFetchClient: { GET, POST: vi.fn() },
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/main',
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
}))

import { useAuth } from './useAuth'

const renderAuth = () => {
  const client = new QueryClient()
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, ...renderHook(() => useAuth(), { wrapper }) }
}

describe('useAuth', () => {
  beforeEach(() => {
    GET.mockReset()
  })

  it('treats a 401 as signed out instead of caching an undefined user', async () => {
    GET.mockResolvedValue({
      data: undefined,
      response: new Response(null, { status: 401 }),
    })
    const { client, result } = renderAuth()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(client.getQueryState(['auth', 'me'])?.status).toBe('success')
  })

  it('returns the signed-in user', async () => {
    const user = { email: 'maya@example.com', id: 'u1', username: 'maya' }
    GET.mockResolvedValue({
      data: user,
      response: new Response(null, { status: 200 }),
    })
    const { result } = renderAuth()

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    expect(result.current.user).toEqual(user)
  })
})
