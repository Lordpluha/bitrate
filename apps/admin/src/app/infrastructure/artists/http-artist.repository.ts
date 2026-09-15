import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
  type Artist,
  ArtistRepository,
  type ListArtistsQuery,
  type SetArtistVerificationInput,
} from '@domain/artist'
import type { Page } from '@domain/shared'
import { ADMIN_API } from '../http/api.config'
import { fetchPage } from '../http/wire-page'
import { artistDto, artistPageDto } from './artist.dto'
import { toArtist } from './artist.mapper'

@Injectable()
export class HttpArtistRepository extends ArtistRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/artists`

  override list({ page, limit, filter }: ListArtistsQuery): Promise<Page<Artist>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: { q: filter.query, verified: filter.verified },
      schema: artistPageDto,
      toDomain: toArtist,
    })
  }

  override async setVerification({ id, verified }: SetArtistVerificationInput): Promise<Artist> {
    const response = await firstValueFrom(
      this.http.patch<unknown>(`${this.base}/${id}/verification`, { verified }),
    )

    return toArtist(artistDto.parse(response))
  }

  override async deactivate(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/${id}`))
  }
}
