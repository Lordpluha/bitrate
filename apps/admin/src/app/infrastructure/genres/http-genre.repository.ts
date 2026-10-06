import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
  type CreateGenreInput,
  type Genre,
  GenreRepository,
  type ListGenresQuery,
  type UpdateGenreInput,
} from '@domain/genre'
import type { Page } from '@domain/shared'
import { ADMIN_API } from '../http/api.config'
import { fetchPage } from '../http/wire-page'
import { createGenreBodyDto, genreDto, genrePageDto, updateGenreBodyDto } from './genre.dto'
import { toGenre, toWireGenreSort } from './genre.mapper'
import { toGenreWriteError } from './to-genre-write-error'

@Injectable()
export class HttpGenreRepository extends GenreRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/genres`

  override list({ page, limit, filter }: ListGenresQuery): Promise<Page<Genre>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        q: filter.query,
        sort: filter.sort ? toWireGenreSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: genrePageDto,
      toDomain: toGenre,
    })
  }

  override async get(id: string): Promise<Genre> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toGenre(genreDto.parse(response))
  }

  override async create(input: CreateGenreInput): Promise<Genre> {
    try {
      const body = createGenreBodyDto.parse(input)
      const response = await firstValueFrom(this.http.post<unknown>(this.base, body))

      return toGenre(genreDto.parse(response))
    } catch (error) {
      throw toGenreWriteError(error, 'create')
    }
  }

  override async update({ id, ...rest }: UpdateGenreInput): Promise<Genre> {
    try {
      const body = updateGenreBodyDto.parse(rest)
      const response = await firstValueFrom(this.http.patch<unknown>(`${this.base}/${id}`, body))

      return toGenre(genreDto.parse(response))
    } catch (error) {
      throw toGenreWriteError(error, 'update')
    }
  }

  override async delete(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.base}/${id}`))
    } catch (error) {
      throw toGenreWriteError(error, 'delete')
    }
  }
}
