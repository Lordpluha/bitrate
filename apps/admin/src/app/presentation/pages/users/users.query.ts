import type { UserSortField } from '@domain/user'
import { coveringTuple, type Sort } from '@domain/shared'
import {
  createQueryCodec,
  intParam,
  sortParam,
  stringParam,
  type QueryCodec,
} from '@presentation/state'

export const USERS_SORT_FIELDS = coveringTuple<UserSortField>()(['username', 'email', 'createdAt'])

export type UsersQuery = {
  query: string
  sort: Sort<UserSortField> | null
  page: number
}

export const usersQueryCodec: QueryCodec<UsersQuery> = createQueryCodec<UsersQuery>({
  defaults: { query: '', sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    sort: sortParam({ members: USERS_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
