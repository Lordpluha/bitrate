import type { normalizePagination } from '@common/pagination'

/** A page of ranked rows, hydrated with the entities their ids point at. */
type RankedPageInput<T extends { id: string }, R extends { id: string }, U> = {
  rows: R[]
  total: bigint | undefined
  entities: T[]
  pagination: ReturnType<typeof normalizePagination>
  /** Builds one item from an entity and the row that ranked it. */
  rank: (entity: T, row: R) => U
}

/** Joins ranked ids back to their entities in rank order, dropping rows whose entity vanished. */
export function toRankedPage<T extends { id: string }, R extends { id: string }, U>({
  rows,
  total,
  entities,
  pagination,
  rank,
}: RankedPageInput<T, R, U>) {
  const byId = new Map(entities.map((entity) => [entity.id, entity]))
  return {
    data: rows.flatMap((row) => {
      const entity = byId.get(row.id)
      return entity ? [rank(entity, row)] : []
    }),
    total: Number(total ?? 0n),
    page: pagination.page,
    limit: pagination.limit,
  }
}
