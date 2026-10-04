import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import {
  type ListPlaylistsQuery,
  type Playlist,
  type PlaylistDetail,
  PlaylistRepository,
  type SetPlaylistVisibilityInput,
} from '@domain/playlist'
import type { Page, TakeDownInput } from '@domain/shared'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API } from '../http/api.config'
import { buildTakeDownBody } from '../http/take-down.dto'
import { toResourceWriteError } from '../http/to-resource-write-error'
import { fetchPage } from '../http/wire-page'
import { playlistDetailDto, playlistPageDto, setPlaylistVisibilityBodyDto } from './playlist.dto'
import {
  toPlaylist,
  toPlaylistDetail,
  toWirePlaylistSort,
  toWirePlaylistStatus,
} from './playlist.mapper'

@Injectable()
export class HttpPlaylistRepository extends PlaylistRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/playlists`

  override list({ page, limit, filter }: ListPlaylistsQuery): Promise<Page<Playlist>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        q: filter.query,
        status: filter.status === undefined ? undefined : toWirePlaylistStatus(filter.status),
        ownerId: filter.ownerId,
        sort: filter.sort ? toWirePlaylistSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: playlistPageDto,
      toDomain: toPlaylist,
    })
  }

  override async getById(id: string): Promise<PlaylistDetail> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toPlaylistDetail(playlistDetailDto.parse(response))
  }

  override async setVisibility({
    id,
    isPublic,
    reason,
  }: SetPlaylistVisibilityInput): Promise<void> {
    const trimmed = reason?.trim()
    const body = setPlaylistVisibilityBodyDto.parse(
      trimmed ? { isPublic, reason: trimmed } : { isPublic },
    )
    try {
      await firstValueFrom(this.http.patch(`${this.base}/${id}/visibility`, body))
    } catch (error) {
      throw toResourceWriteError(error, 'visibility')
    }
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
