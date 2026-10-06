import { inject, Injectable } from '@angular/core'
import { type Genre, type GenreFilter, GenreRepository } from '@domain/genre'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

export type ListGenresInput = {
  page: number
  filter?: GenreFilter
}

@Injectable({ providedIn: 'root' })
export class ListGenresUseCase {
  private readonly genres = inject(GenreRepository)

  execute({ page, filter = {} }: ListGenresInput): Promise<Page<Genre>> {
    return this.genres.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
