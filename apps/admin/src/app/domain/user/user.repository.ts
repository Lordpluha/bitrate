import type { Page, PageRequest, TakeDownInput } from '../shared'
import type { User, UserDetail, UserFilter } from './user'

export type ListUsersQuery = PageRequest & {
  filter: UserFilter
}

/** The port the listeners screens talk to. */
export abstract class UserRepository {
  abstract list(query: ListUsersQuery): Promise<Page<User>>
  abstract getById(id: string): Promise<UserDetail>
  /** Soft-deletes the account — the API also revokes its sessions. */
  abstract deactivate(input: TakeDownInput): Promise<void>
  abstract restore(input: TakeDownInput): Promise<void>
  /** @returns How many sessions were revoked. */
  abstract revokeSessions(input: TakeDownInput): Promise<number>
}
