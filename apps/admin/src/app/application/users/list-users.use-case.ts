import { inject, Injectable } from '@angular/core'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'
import { type User, type UserFilter, UserRepository } from '@domain/user'

export type ListUsersInput = {
  page: number
  filter?: UserFilter
}

@Injectable({ providedIn: 'root' })
export class ListUsersUseCase {
  private readonly users = inject(UserRepository)

  execute({ page, filter = {} }: ListUsersInput): Promise<Page<User>> {
    return this.users.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
