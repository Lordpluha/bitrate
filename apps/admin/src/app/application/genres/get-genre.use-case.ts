import { inject, Injectable } from '@angular/core'
import { type Genre, GenreRepository } from '@domain/genre'

@Injectable({ providedIn: 'root' })
export class GetGenreUseCase {
  private readonly genres = inject(GenreRepository)

  execute(id: string): Promise<Genre> {
    return this.genres.get(id)
  }
}
