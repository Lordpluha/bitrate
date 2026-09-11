import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API, fetchPage } from './admin-http'
import { type AdminUser, adminUserPageSchema } from './schemas'
import type { Page } from '../lib/collection'

type ListUsersInput = {
  page: number
  q?: string
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/users`

  list({ page, q }: ListUsersInput): Promise<Page<AdminUser>> {
    return fetchPage<Page<AdminUser>>({
      http: this.http,
      url: this.base,
      page,
      filters: { q },
      schema: adminUserPageSchema,
    })
  }

  async softDelete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/${id}`))
  }
}
