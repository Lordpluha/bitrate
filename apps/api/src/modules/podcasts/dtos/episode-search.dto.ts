import { z } from 'zod'

/** Longest accepted episode search, matching the other public search params. */
export const EPISODE_SEARCH_MAX_LENGTH = 100

/** Optional `q` of a podcast's episode page: trimmed, so blank means no search. */
export const EpisodeSearchSchema = z.string().trim().max(EPISODE_SEARCH_MAX_LENGTH).optional()
