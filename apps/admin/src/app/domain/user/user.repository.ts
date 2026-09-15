import type { Page, PageRequest } from '../shared/page'
import type { User, UserFilter } from './user'

export type ListUsersQuery = PageRequest & {
  filter: UserFilter
}

/** The port the listeners screen talks to. */
export abstract class UserRepository {
  abstract list(query: ListUsersQuery): Promise<Page<User>>
  abstract deactivate(id: string): Promise<void>
}
