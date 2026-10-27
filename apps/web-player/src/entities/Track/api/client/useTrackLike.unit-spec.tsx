import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'
import { apiQueryKeys } from '@/shared/api/queryKeys'
import { useTrackLike } from './useTrackLike'

const likedTracks = Array.from({ length: 150 }, (_, index) => ({
  id: `t${index}`,
}))

const renderWithLikes = (trackId: string) => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY } },
  })
  client.setQueryData(apiQueryKeys.tracks.likedAll, likedTracks)
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(() => useTrackLike(trackId), { wrapper })
}

describe('useTrackLike', () => {
  it('knows a track is liked wherever it sits in a long liked list', () => {
    expect(renderWithLikes('t140').result.current.isLiked).toBe(true)
  })

  it('reports a track that was never liked as not liked', () => {
    expect(renderWithLikes('t-other').result.current.isLiked).toBe(false)
  })
})
