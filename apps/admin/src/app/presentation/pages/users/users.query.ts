import { coveringTuple, type ResourceStatus, type Sort } from '@domain/shared'
import type { UserSortField } from '@domain/user'
import {
  createQueryCodec,
  intParam,
  resourceStatusParam,
  sortParam,
  stringParam,
  type QueryCodec,
} from '@presentation/state'

export const USERS_SORT_FIELDS = coveringTuple<UserSortField>()(['username', 'email', 'createdAt'])

export type UsersQuery = {
  query: string
  status: ResourceStatus
  sort: Sort<UserSortField> | null
  page: number
}

/** `status` defaults to `active` and is omitted from a clean URL, same convention as `page`. */
export const usersQueryCodec: QueryCodec<UsersQuery> = createQueryCodec<UsersQuery>({
  defaults: { query: '', status: 'active', sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    status: { param: 'status', codec: resourceStatusParam() },
    sort: sortParam({ members: USERS_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
