import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { Page } from '@domain/shared'
import { type ListUsersQuery, type User, UserRepository } from '@domain/user'
import { ADMIN_API } from '../http/api.config'
import { fetchPage } from '../http/wire-page'
import { userPageDto } from './user.dto'
import { toUser, toWireUserSort } from './user.mapper'

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
        sort: filter.sort ? toWireUserSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: userPageDto,
      toDomain: toUser,
    })
  }

  override async deactivate(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/${id}`))
  }
}
