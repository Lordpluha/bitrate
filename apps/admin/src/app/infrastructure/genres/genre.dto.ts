import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import * as z from 'zod'

/** The `sort` query parameter's own union, read from the operation directly. */
export type WireGenreSortField = NonNullable<
  ApiPaths['/api/v1/admin/genres']['get']['parameters']['query']
>['sort']

type ContractGenre = Pick<
  ApiSchemas['AdminGenreEntity'],
  'id' | 'slug' | 'name' | 'description' | 'color' | 'counts' | 'createdAt' | 'updatedAt'
>

const genreCountsDto = z.object({
  tracks: z.number().int(),
  albums: z.number().int(),
  artists: z.number().int(),
})

export const genreDto = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  counts: genreCountsDto,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractGenre>

export type GenreDto = z.infer<typeof genreDto>

type ContractGenrePage = Omit<ApiSchemas['PaginatedAdminGenresEntity'], 'data'> & {
  data: ContractGenre[]
}

export const genrePageDto = z.object({
  data: z.array(genreDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractGenrePage>

/** The 409 body of a refused delete: the references that block it. */
export const genreInUseBodyDto = z.object({ counts: genreCountsDto })

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

/**
 * Request bodies, bound to the contract like every response DTO above. A renamed field on the
 * API side is a compile error here rather than a 400 in front of an operator.
 */
export const createGenreBodyDto = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().regex(HEX_COLOR).nullable().optional(),
}) satisfies z.ZodType<ApiSchemas['CreateGenreDto']>

export const updateGenreBodyDto = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().regex(HEX_COLOR).nullable().optional(),
}) satisfies z.ZodType<ApiSchemas['UpdateGenreDto']>
