import { inject, Injectable } from '@angular/core'
import { type CreateGenreInput, type Genre, GenreRepository } from '@domain/genre'

@Injectable({ providedIn: 'root' })
export class CreateGenreUseCase {
  private readonly genres = inject(GenreRepository)

  execute(input: CreateGenreInput): Promise<Genre> {
    return this.genres.create(input)
  }
}
