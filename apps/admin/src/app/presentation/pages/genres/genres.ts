import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { DeleteGenreUseCase, ListGenresUseCase } from '@application/genres'
import { SessionStore } from '@application/session'
import { canDeleteGenre, type Genre, type GenreSortField } from '@domain/genre'
import { ActionNotAllowedError, DEFAULT_PAGE_SIZE, type Sort } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronRight, lucidePlus, lucideTrash2 } from '@ng-icons/lucide'
import {
  CollectionStatus,
  PageHeader,
  Paginator,
  PanelBar,
  SearchField,
  SortHeader,
  sortHeaderAriaSort,
  StateMessage,
  TablePanel,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { bindQueryState, bindSearchDraft, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { genreDeleteError } from './genre-write-error.message'
import { genresQueryCodec } from './genres.query'

const LOAD_ERROR = 'genres.error.load'

@Component({
  selector: 'app-genres',
  imports: [
    CollectionStatus,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmTableImports,
    NgIcon,
    PageHeader,
    Paginator,
    PanelBar,
    RouterLink,
    SearchField,
    SortHeader,
    StateMessage,
    TablePanel,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideChevronRight, lucidePlus, lucideTrash2 })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './genres.html',
})
export class GenresPage {
  private readonly listGenres = inject(ListGenresUseCase)
  private readonly deleteGenre = inject(DeleteGenreUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  private readonly session = inject(SessionStore)
  protected readonly canWrite = this.session.can('genres:write')
  protected readonly canDelete = this.session.can('genres:delete')
  protected readonly ariaSort = sortHeaderAriaSort<GenreSortField>

  protected readonly query = bindQueryState({ codec: genresQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })
  protected readonly pendingDelete = signal<Genre | null>(null)
  protected readonly deleting = signal(false)
  protected readonly deleteError = signal<Notice | null>(null)

  protected readonly collection = createCollection<Genre>({
    errorMessage: LOAD_ERROR,
    load: (page) =>
      this.listGenres.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          sort: this.query.state().sort ?? undefined,
        },
      }),
  })

  protected readonly failureText = computed(() =>
    this.collection.failure() === null ? null : this.t(LOAD_ERROR),
  )
  protected readonly deleteErrorText = computed(() => {
    const notice = this.deleteError()
    return notice === null ? null : this.t(notice.key, notice.params)
  })

  protected readonly range = computed(() => {
    const total = this.collection.total()
    if (this.collection.loading() || this.collection.failure() || total === 0) return null
    const from = (this.collection.page() - 1) * DEFAULT_PAGE_SIZE + 1
    return { from, to: from + this.collection.items().length - 1, total }
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })
  }

  protected setSort(next: Sort<GenreSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected clearSearch(): void {
    this.draft.set('')
    this.query.patch({ query: '', page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  /** Whether the genre is still in use, and so cannot be deleted. */
  protected inUse(genre: Genre): boolean {
    return !canDeleteGenre(genre).allowed
  }

  protected askDelete(genre: Genre): void {
    this.deleteError.set(null)
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
      this.deleteError.set(
        error instanceof ActionNotAllowedError
          ? { key: 'genres.usedBy', params: { ...genre.counts } }
          : genreDeleteError(error),
      )
    } finally {
      this.deleting.set(false)
    }
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
