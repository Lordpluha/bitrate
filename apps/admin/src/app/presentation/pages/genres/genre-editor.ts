import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { CreateGenreUseCase, GetGenreUseCase, UpdateGenreUseCase } from '@application/genres'
import { SessionStore } from '@application/session'
import type { Genre } from '@domain/genre'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { genreEditorSchema } from './genre-editor.schema'
import { genreWriteErrorMessage } from './genre-write-error.message'

type GenreField = 'name' | 'slug' | 'description' | 'color'

@Component({
  selector: 'app-genre-editor',
  imports: [ReactiveFormsModule, RouterLink, HlmButtonImports, HlmInputImports, HlmLabelImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './genre-editor.html',
})
export class GenreEditorPage {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly getGenre = inject(GetGenreUseCase)
  private readonly createGenre = inject(CreateGenreUseCase)
  private readonly updateGenre = inject(UpdateGenreUseCase)

  protected readonly canWrite = inject(SessionStore).can('genres:write')
  protected readonly genreId = this.route.snapshot.paramMap.get('id')

  protected readonly genre = signal<Genre | null>(null)
  protected readonly loading = signal(this.genreId !== null)
  protected readonly submitting = signal(false)
  protected readonly failure = signal<string | null>(null)

  protected readonly form = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true }),
      slug: new FormControl('', { nonNullable: true }),
      description: new FormControl('', { nonNullable: true }),
      color: new FormControl('', { nonNullable: true }),
    },
    { validators: zodValidator(genreEditorSchema) },
  )

  constructor() {
    void this.load()
  }

  protected errorFor(field: GenreField): string | null {
    const control = this.form.get(field)
    if (!control || !control.touched) return null

    return zodErrorMessage(control)
  }

  /** The colour as a swatch only when it is a complete hex value. */
  protected swatch(): string | null {
    const color = this.form.controls.color.value
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : null
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
      this.failure.set(genreWriteErrorMessage({ error, slug: this.form.controls.slug.value }))
    } finally {
      this.submitting.set(false)
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
    } catch {
      this.failure.set('Could not load this genre.')
    } finally {
      this.loading.set(false)
    }
  }
}
