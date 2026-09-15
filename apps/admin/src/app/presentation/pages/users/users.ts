import { DatePipe } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { DeactivateUserUseCase, ListUsersUseCase } from '@application/users'
import type { User } from '@domain/user'
import { CollectionStatus, Paginator } from '@presentation/components'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'

@Component({
  selector: 'app-users',
  imports: [
    DatePipe,
    CollectionStatus,
    Paginator,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './users.html',
})
export class UsersPage {
  private readonly listUsers = inject(ListUsersUseCase)
  private readonly deactivateUser = inject(DeactivateUserUseCase)

  protected readonly query = signal('')
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<User>({
    errorMessage: 'Could not load users.',
    load: (page) => this.listUsers.execute({ page, filter: { query: this.query() || undefined } }),
  })

  constructor() {
    void this.collection.restart()
  }

  protected async applyFilters(): Promise<void> {
    await this.collection.restart()
  }

  protected async remove(user: User): Promise<void> {
    this.busyId.set(user.id)
    try {
      await this.deactivateUser.execute(user)
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not deactivate ${user.username}.`)
    } finally {
      this.busyId.set(null)
    }
  }
}
