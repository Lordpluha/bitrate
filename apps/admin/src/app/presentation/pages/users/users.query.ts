import { createQueryCodec, intParam, stringParam, type QueryCodec } from '@presentation/state'

export type UsersQuery = {
  query: string
  page: number
}

export const usersQueryCodec: QueryCodec<UsersQuery> = createQueryCodec({
  defaults: { query: '', page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    page: { param: 'page', codec: intParam(1) },
  },
})
