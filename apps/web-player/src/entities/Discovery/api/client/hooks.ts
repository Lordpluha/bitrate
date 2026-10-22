'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { clientFetchClient } from '@/shared/api/client'
import { ensureOkResponse } from '@/shared/api/errors'
import { apiQueryKeys } from '@/shared/api/queryKeys'
import {
  artistChartsSchema,
  browseCategoriesSchema,
  categoryPlaylistsSchema,
  chartsSchema,
  recommendationsFeedSchema,
  topArtistsSchema,
  topTracksSchema,
} from './discovery.schemas'

export type DiscoveryRange = 'short' | 'medium' | 'long'
type ChartScope = 'global' | 'viral' | 'country'

export const useBrowseCategories = (page = 1, limit = 100) =>
  useQuery({
    queryKey: apiQueryKeys.discovery.categories(page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/browse/categories',
        { params: { query: { page, limit } } },
      )
      ensureOkResponse(response, 'Failed to load browse categories')
      return browseCategoriesSchema.parse(data)
    },
    staleTime: 10 * 60 * 1000,
  })

export const useCategoryPlaylists = (slug: string, page = 1, limit = 20) =>
  useQuery({
    queryKey: apiQueryKeys.discovery.categoryPlaylists(slug, page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/browse/categories/{slug}/playlists',
        { params: { path: { slug }, query: { page, limit } } },
      )
      ensureOkResponse(response, 'Failed to load category playlists')
      return categoryPlaylistsSchema.parse(data)
    },
    enabled: slug.length > 0,
    staleTime: 5 * 60 * 1000,
  })

export const useRecommendationsFeed = () =>
  useQuery({
    queryKey: apiQueryKeys.discovery.feed,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/recommendations/feed',
      )
      ensureOkResponse(response, 'Failed to load recommendations')
      return recommendationsFeedSchema.parse(data)
    },
    staleTime: 60 * 1000,
  })

type UseChartsInput = {
  scope?: ChartScope
  page?: number
  limit?: number
  country?: string
  /** Browse category slug: only tracks in that genre. */
  genre?: string
}

/** Public playlists that contain an artist's tracks, most followed first. */
export const useArtistPlaylists = (artistId: string, page = 1, limit = 12) =>
  useQuery({
    enabled: Boolean(artistId),
    queryKey: apiQueryKeys.discovery.artistPlaylists(artistId, page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/artists/{id}/playlists',
        { params: { path: { id: artistId }, query: { page, limit } } },
      )
      ensureOkResponse(
        response,
        'Failed to load playlists featuring the artist',
      )
      return categoryPlaylistsSchema.parse(data)
    },
    staleTime: 5 * 60 * 1000,
  })

/** The tracks chart, ranked by real listening (`GET /charts/tracks`). */
export const useCharts = ({
  scope = 'global',
  page = 1,
  limit = 20,
  country,
  genre,
}: UseChartsInput = {}) =>
  useQuery({
    queryKey: apiQueryKeys.discovery.charts(scope, country, page, limit, genre),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/charts/tracks',
        { params: { query: { country, genre, limit, page, scope } } },
      )
      ensureOkResponse(response, 'Failed to load charts')
      return chartsSchema.parse(data)
    },
    staleTime: 5 * 60 * 1000,
  })

/** Artists ranked by distinct listeners (`GET /charts/artists`). */
export const useArtistCharts = ({
  scope = 'global',
  page = 1,
  limit = 20,
}: Omit<UseChartsInput, 'country' | 'genre'> = {}) =>
  useQuery({
    queryKey: apiQueryKeys.discovery.artistCharts(scope, page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/charts/artists',
        { params: { query: { limit, page, scope } } },
      )
      ensureOkResponse(response, 'Failed to load the artists chart')
      return artistChartsSchema.parse(data)
    },
    staleTime: 5 * 60 * 1000,
  })

export const useTopTracks = (
  range: DiscoveryRange = 'medium',
  page = 1,
  limit = 20,
) =>
  useQuery({
    queryKey: apiQueryKeys.discovery.topTracks(range, page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/me/top/tracks',
        { params: { query: { limit, page, range } } },
      )
      ensureOkResponse(response, 'Failed to load top tracks')
      return topTracksSchema.parse(data)
    },
    /** Switching the range keeps the old list up instead of flashing a skeleton. */
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

export const useTopArtists = (
  range: DiscoveryRange = 'medium',
  page = 1,
  limit = 20,
) =>
  useQuery({
    queryKey: apiQueryKeys.discovery.topArtists(range, page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/me/top/artists',
        { params: { query: { limit, page, range } } },
      )
      ensureOkResponse(response, 'Failed to load top artists')
      return topArtistsSchema.parse(data)
    },
    /** Switching the range keeps the old list up instead of flashing a skeleton. */
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
