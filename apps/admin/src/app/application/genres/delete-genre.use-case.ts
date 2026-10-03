import { inject, Injectable } from '@angular/core'
import { canDeleteGenre, type Genre, GenreRepository } from '@domain/genre'
import { ActionNotAllowedError } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class DeleteGenreUseCase {
  private readonly genres = inject(GenreRepository)

  /**
   * @throws {ActionNotAllowedError} When `canDeleteGenre` already says no — the genre is still
   * referenced. The API re-checks the same rule; this only spares a doomed request.
   */
  async execute(genre: Genre): Promise<void> {
    const decision = canDeleteGenre(genre)
    if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)

    await this.genres.delete(genre.id)
  }
}
