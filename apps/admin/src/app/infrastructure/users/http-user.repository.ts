import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { Page, TakeDownInput } from '@domain/shared'
import { type ListUsersQuery, type User, type UserDetail, UserRepository } from '@domain/user'
import { ADMIN_API } from '../http/api.config'
import { buildTakeDownBody, revokeSessionsResultDto } from '../http/take-down.dto'
import { toResourceWriteError } from '../http/to-resource-write-error'
import { fetchPage } from '../http/wire-page'
import { userDetailDto, userPageDto } from './user.dto'
import { toUser, toUserDetail, toWireUserSort, toWireUserStatus } from './user.mapper'

@Injectable()
export class HttpUserRepository extends UserRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/users`

  override list({ page, limit, filter }: ListUsersQuery): Promise<Page<User>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        q: filter.query,
        status: filter.status ? toWireUserStatus(filter.status) : undefined,
        sort: filter.sort ? toWireUserSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: userPageDto,
      toDomain: toUser,
    })
  }

  override async getById(id: string): Promise<UserDetail> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toUserDetail(userDetailDto.parse(response))
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
}
