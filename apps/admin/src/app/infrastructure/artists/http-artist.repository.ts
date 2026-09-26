import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
  ARTIST_ALBUMS_PAGE_SIZE,
  ARTIST_TRACKS_PAGE_SIZE,
  type Artist,
  ArtistRepository,
  type ArtistAlbum,
  type ArtistDetail,
  type ArtistTrack,
  type ListArtistsQuery,
  type SetArtistVerificationInput,
} from '@domain/artist'
import type { Page, TakeDownInput } from '@domain/shared'
import { ADMIN_API } from '../http/api.config'
import { buildTakeDownBody, revokeSessionsResultDto } from '../http/take-down.dto'
import { toResourceWriteError } from '../http/to-resource-write-error'
import { fetchPage } from '../http/wire-page'
import { artistAlbumPageDto, artistTrackPageDto } from './artist-publications.dto'
import { toArtistAlbum, toArtistTrack } from './artist-publications.mapper'
import { artistDetailDto, artistDto, artistPageDto } from './artist.dto'
import { toArtist, toArtistDetail, toWireArtistSort, toWireArtistStatus } from './artist.mapper'

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
      filters: {
        q: filter.query,
        verified: filter.verified,
        status: filter.status ? toWireArtistStatus(filter.status) : undefined,
        sort: filter.sort ? toWireArtistSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: artistPageDto,
      toDomain: toArtist,
    })
  }

  override async getById(id: string): Promise<ArtistDetail> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toArtistDetail(artistDetailDto.parse(response))
  }

  override async setVerification({ id, verified }: SetArtistVerificationInput): Promise<Artist> {
    const response = await firstValueFrom(
      this.http.patch<unknown>(`${this.base}/${id}/verification`, { verified }),
    )

    return toArtist(artistDto.parse(response))
  }

  override async deactivate({ id, reason }: TakeDownInput): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.base}/${id}`, { body: buildTakeDownBody(reason) }),
      )
    } catch (error) {
      throw toResourceWriteError(error, 'deactivate')
    }
  }

  override async restore({ id, reason }: TakeDownInput): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.base}/${id}/restore`, buildTakeDownBody(reason)))
    } catch (error) {
      throw toResourceWriteError(error, 'restore')
    }
  }

  override async revokeSessions({ id, reason }: TakeDownInput): Promise<number> {
    const response = await firstValueFrom(
      this.http.post<unknown>(`${this.base}/${id}/sessions/revoke`, buildTakeDownBody(reason)),
    )

    return revokeSessionsResultDto.parse(response).revoked
  }

  override listTracks(artistId: string, page: number): Promise<Page<ArtistTrack>> {
    return fetchPage({
      http: this.http,
      url: `${this.base}/${artistId}/tracks`,
      page,
      limit: ARTIST_TRACKS_PAGE_SIZE,
      schema: artistTrackPageDto,
      toDomain: toArtistTrack,
    })
  }

  override listAlbums(artistId: string, page: number): Promise<Page<ArtistAlbum>> {
    return fetchPage({
      http: this.http,
      url: `${this.base}/${artistId}/albums`,
      page,
      limit: ARTIST_ALBUMS_PAGE_SIZE,
      schema: artistAlbumPageDto,
      toDomain: toArtistAlbum,
    })
  }
}
