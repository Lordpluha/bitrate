import { Component, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { SessionStore } from '@application/session'
import { DeactivateUserUseCase, ListUsersUseCase } from '@application/users'
import type { ResourceStatus, Sort } from '@domain/shared'
import type { User, UserSortField } from '@domain/user'
import {
  CollectionStatus,
  Paginator,
  SortHeader,
  sortHeaderAriaSort,
} from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { debounceTime, skip } from 'rxjs'
import { usersQueryCodec } from './users.query'

/** How long to wait after the last keystroke before a text filter reaches the URL. */
const SEARCH_DEBOUNCE_MS = 300

@Component({
  selector: 'app-users',
  imports: [
    LocalizedDatePipe,
    RouterLink,
    CollectionStatus,
    Paginator,
    SortHeader,
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

  protected readonly canDelete = inject(SessionStore).can('users:delete')
  protected readonly ariaSort = sortHeaderAriaSort<UserSortField>

  protected readonly query = bindQueryState({ codec: usersQueryCodec })
  protected readonly draft = signal(this.query.state().query)
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<User>({
    errorMessage: 'Could not load users.',
    load: (page) =>
      this.listUsers.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          status: this.query.state().status,
          sort: this.query.state().sort ?? undefined,
        },
      }),
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })

    /** Keeps the box in sync with the URL, e.g. after back/forward changes the filter. */
    effect(() => {
      const { query: urlQuery } = this.query.state()
      this.draft.set(urlQuery)
    })

    toObservable(this.draft)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), skip(1), takeUntilDestroyed())
      .subscribe((value) => this.query.patch({ query: value, page: 1 }, { replaceUrl: true }))
  }

  protected applyFilters(): void {
    this.query.patch({ query: this.draft(), page: 1 })
  }

  protected setStatus(status: ResourceStatus): void {
    this.query.patch({ status, page: 1 })
  }

  protected setSort(next: Sort<UserSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected async remove(user: User): Promise<void> {
    this.busyId.set(user.id)
    try {
      await this.deactivateUser.execute({ user })
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not deactivate ${user.username}.`)
    } finally {
      this.busyId.set(null)
    }
  }
}
