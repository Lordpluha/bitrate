import { Component, inject, signal } from '@angular/core'
import { type AdminUser, UsersService } from '@shared/api'
import { CollectionStatus, Paginator } from '@shared/components'
import { createCollection } from '@shared/lib/collection'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { DatePipe } from '@angular/common'

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
  private readonly users = inject(UsersService)

  protected readonly query = signal('')
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<AdminUser>({
    errorMessage: 'Could not load users.',
    load: (page) => this.users.list({ page, q: this.query() || undefined }),
  })

  constructor() {
    void this.collection.restart()
  }

  protected async applyFilters(): Promise<void> {
    await this.collection.restart()
  }

  protected async remove(user: AdminUser): Promise<void> {
    this.busyId.set(user.id)
    try {
      await this.users.softDelete(user.id)
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not deactivate ${user.username}.`)
    } finally {
      this.busyId.set(null)
    }
  }
}
