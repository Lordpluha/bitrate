import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { type Album, type AlbumDetail, AlbumRepository, type ListAlbumsQuery } from '@domain/album'
import type { Page, TakeDownInput } from '@domain/shared'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API } from '../http/api.config'
import { buildTakeDownBody } from '../http/take-down.dto'
import { toResourceWriteError } from '../http/to-resource-write-error'
import { fetchPage } from '../http/wire-page'
import { albumDetailDto, albumPageDto } from './album.dto'
import { toAlbum, toAlbumDetail, toWireAlbumSort, toWireAlbumStatus } from './album.mapper'

@Injectable()
export class HttpAlbumRepository extends AlbumRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/albums`

  override list({ page, limit, filter }: ListAlbumsQuery): Promise<Page<Album>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        q: filter.query,
        status: filter.status === undefined ? undefined : toWireAlbumStatus(filter.status),
        artistId: filter.artistId,
        sort: filter.sort ? toWireAlbumSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: albumPageDto,
      toDomain: toAlbum,
    })
  }

  override async getById(id: string): Promise<AlbumDetail> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toAlbumDetail(albumDetailDto.parse(response))
  }

  override async takeDown({ id, reason }: TakeDownInput): Promise<void> {
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
}
