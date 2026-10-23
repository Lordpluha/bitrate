import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CreateGenreUseCase,
  DeleteGenreUseCase,
  GetGenreUseCase,
  UpdateGenreUseCase,
} from '@application/genres'
import { SessionStore } from '@application/session'
import { canDeleteGenre, type Genre } from '@domain/genre'
import { ActionNotAllowedError, ResourceNotFoundError } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideActivity, lucideCheck, lucideEye, lucideTags, lucideTrash2 } from '@ng-icons/lucide'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { KvRow, PageHeader, Skeleton, StateMessage, Tile, TileGrid } from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { genreEditorSchema } from './genre-editor.schema'
import { genreDeleteError, genreWriteError } from './genre-write-error.message'

type GenreField = 'name' | 'slug' | 'description' | 'color'

/** The description's limit, as the schema enforces it — shown as a running count. */
const DESCRIPTION_MAX = 1000

/**
 * Over 100 lines: create, edit and delete share the loaded genre, the form and the failure
 * reporting on one record.
 */
@Component({
  selector: 'app-genre-editor',
  imports: [
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmLabelImports,
    KvRow,
    NgIcon,
    PageHeader,
    ReactiveFormsModule,
    Skeleton,
    StateMessage,
    Tile,
    TileGrid,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideActivity, lucideCheck, lucideEye, lucideTags, lucideTrash2 })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './genre-editor.html',
})
export class GenreEditorPage {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly getGenre = inject(GetGenreUseCase)
  private readonly createGenre = inject(CreateGenreUseCase)
  private readonly updateGenre = inject(UpdateGenreUseCase)
  private readonly deleteGenre = inject(DeleteGenreUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canWrite = inject(SessionStore).can('genres:write')
  protected readonly canDelete = inject(SessionStore).can('genres:delete')
  protected readonly genreId = this.route.snapshot.paramMap.get('id')
  protected readonly descriptionMax = DESCRIPTION_MAX

  protected readonly genre = signal<Genre | null>(null)
  protected readonly loading = signal(this.genreId !== null)
  protected readonly notFound = signal(false)
  protected readonly loadFailed = signal(false)
  protected readonly submitting = signal(false)
  protected readonly failure = signal<Notice | null>(null)
  protected readonly confirmingDelete = signal(false)
  protected readonly deleting = signal(false)

  protected readonly form = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true }),
      slug: new FormControl('', { nonNullable: true }),
      description: new FormControl('', { nonNullable: true }),
      color: new FormControl('', { nonNullable: true }),
    },
    { validators: zodValidator(genreEditorSchema) },
  )

  /** The form as it is typed, for the preview tile. */
  protected readonly draft = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  })

  protected readonly back = computed(() => ({ link: '/genres', label: this.t('genres.title') }))
  protected readonly failureText = computed(() => {
    const notice = this.failure()
    return notice === null ? null : this.t(notice.key, notice.params)
  })
  protected readonly deletable = computed(() => {
    const genre = this.genre()
    return genre !== null && this.canDelete() && canDeleteGenre(genre).allowed
  })

  constructor() {
    void this.load()
  }

  /** The field's error as a transloco key, once the operator has touched it. */
  protected errorFor(field: GenreField): string | null {
    const control = this.form.get(field)
    if (!control || !control.touched) return null

    return zodErrorMessage(control)
  }

  /** The colour as a swatch only when it is a complete hex value. */
  protected swatch(): string | null {
    const color = this.draft().color ?? ''
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : null
  }

  protected reload(): void {
    this.loadFailed.set(false)
    this.loading.set(true)
    void this.load()
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    this.failure.set(null)
    if (this.form.invalid || this.submitting() || !this.canWrite()) return

    this.submitting.set(true)
    try {
      const saved = await this.save()
      await this.router.navigate(['/genres', saved.id])
      this.genre.set(saved)
    } catch (error) {
      this.failure.set(genreWriteError({ error, slug: this.form.controls.slug.value }))
    } finally {
      this.submitting.set(false)
    }
  }

  protected cancelDelete(): void {
    if (!this.deleting()) this.confirmingDelete.set(false)
  }

  protected async confirmDelete(): Promise<void> {
    const genre = this.genre()
    if (!genre || this.deleting()) return

    this.deleting.set(true)
    this.failure.set(null)
    try {
      await this.deleteGenre.execute(genre)
      this.confirmingDelete.set(false)
      await this.router.navigate(['/genres'])
    } catch (error) {
      this.confirmingDelete.set(false)
      this.failure.set(
        error instanceof ActionNotAllowedError
          ? { key: 'genres.usedBy', params: { ...genre.counts } }
          : genreDeleteError(error),
      )
    } finally {
      this.deleting.set(false)
    }
  }

  private save(): Promise<Genre> {
    const values = this.form.getRawValue()

    if (this.genreId === null) {
      return this.createGenre.execute({
        name: values.name.trim(),
        slug: values.slug || undefined,
        description: values.description || null,
        color: values.color || null,
      })
    }

    return this.updateGenre.execute({
      id: this.genreId,
      name: values.name.trim(),
      ...(values.slug && { slug: values.slug }),
      description: values.description || null,
      color: values.color || null,
    })
  }

  private async load(): Promise<void> {
    if (this.genreId === null) return

    try {
      const genre = await this.getGenre.execute(this.genreId)
      this.genre.set(genre)
      this.form.setValue({
        name: genre.name,
        slug: genre.slug,
        description: genre.description ?? '',
        color: genre.color ?? '',
      })
      if (!this.canWrite()) this.form.disable()
    } catch (error) {
      if (error instanceof ResourceNotFoundError) this.notFound.set(true)
      else this.loadFailed.set(true)
    } finally {
      this.loading.set(false)
    }
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
