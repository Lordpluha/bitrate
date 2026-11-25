/** One page of a listener's taste feedback ("Not interested" or taste exclusions). */
export type TastePage<Type extends string> = {
  data: Array<{ entityType: Type; entityId: string; createdAt: Date }>
  total: number
  page: number
  limit: number
}

/** The columns a taste feedback page returns. */
export const TASTE_ITEM_SELECT = { entityType: true, entityId: true, createdAt: true } as const

/** Newest first, with the id as a stable tie-break between rows created together. */
export const TASTE_NEWEST_FIRST = [{ createdAt: 'desc' }, { entityId: 'asc' }] as const
