import { inject, Injectable } from '@angular/core'
import { type Genre, GenreRepository, type UpdateGenreInput } from '@domain/genre'

@Injectable({ providedIn: 'root' })
export class UpdateGenreUseCase {
  private readonly genres = inject(GenreRepository)

  execute(input: UpdateGenreInput): Promise<Genre> {
    return this.genres.update(input)
  }
}
