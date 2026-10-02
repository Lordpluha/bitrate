import { Component, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { DeleteGenreUseCase, ListGenresUseCase } from '@application/genres'
import { SessionStore } from '@application/session'
import { canDeleteGenre, type Genre, type GenreSortField } from '@domain/genre'
import { ActionNotAllowedError, type Sort } from '@domain/shared'
import {
  CollectionStatus,
  Paginator,
  SortHeader,
  sortHeaderAriaSort,
} from '@presentation/components'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { debounceTime, skip } from 'rxjs'
import { genreDeleteErrorMessage } from './genre-write-error.message'
import { genresQueryCodec } from './genres.query'

/** How long to wait after the last keystroke before a text filter reaches the URL. */
const SEARCH_DEBOUNCE_MS = 300

@Component({
  selector: 'app-genres',
  imports: [
    RouterLink,
    CollectionStatus,
    Paginator,
    SortHeader,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './genres.html',
})
export class GenresPage {
  private readonly listGenres = inject(ListGenresUseCase)
  private readonly deleteGenre = inject(DeleteGenreUseCase)

  private readonly session = inject(SessionStore)
  protected readonly canWrite = this.session.can('genres:write')
  protected readonly canDelete = this.session.can('genres:delete')
  protected readonly ariaSort = sortHeaderAriaSort<GenreSortField>

  protected readonly query = bindQueryState({ codec: genresQueryCodec })
  protected readonly draft = signal(this.query.state().query)
  protected readonly pendingDelete = signal<Genre | null>(null)
  protected readonly deleting = signal(false)

  protected readonly collection = createCollection<Genre>({
    errorMessage: 'Could not load genres.',
    load: (page) =>
      this.listGenres.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
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
      this.draft.set(this.query.state().query)
    })

    toObservable(this.draft)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), skip(1), takeUntilDestroyed())
      .subscribe((value) => this.query.patch({ query: value, page: 1 }, { replaceUrl: true }))
  }

  protected applyFilters(): void {
    this.query.patch({ query: this.draft(), page: 1 })
  }

  protected setSort(next: Sort<GenreSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  /** Why this genre cannot be deleted, or `null` when it can. */
  protected blockedReason(genre: Genre): string | null {
    const decision = canDeleteGenre(genre)
    return decision.allowed ? null : decision.reason
  }

  protected askDelete(genre: Genre): void {
    this.pendingDelete.set(genre)
  }

  protected cancelDelete(): void {
    if (!this.deleting()) this.pendingDelete.set(null)
  }

  protected async confirmDelete(): Promise<void> {
    const genre = this.pendingDelete()
    if (!genre || this.deleting()) return

    this.deleting.set(true)
    try {
      await this.deleteGenre.execute(genre)
      this.pendingDelete.set(null)
      await this.collection.reload()
    } catch (error) {
      this.pendingDelete.set(null)
      this.collection.fail(
        error instanceof ActionNotAllowedError ? error.message : genreDeleteErrorMessage(error),
      )
    } finally {
      this.deleting.set(false)
    }
  }
}
