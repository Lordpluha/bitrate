import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API, fetchPage } from './admin-http'
import { type AdminArtist, adminArtistPageSchema, adminArtistSchema } from './schemas'
import type { Page } from '../lib/collection'

type ListArtistsInput = {
  page: number
  q?: string
  verified?: boolean
}

@Injectable({ providedIn: 'root' })
export class ArtistsService {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/artists`

  list({ page, q, verified }: ListArtistsInput): Promise<Page<AdminArtist>> {
    return fetchPage<Page<AdminArtist>>({
      http: this.http,
      url: this.base,
      page,
      filters: { q, verified },
      schema: adminArtistPageSchema,
    })
  }

  async setVerified(id: string, verified: boolean): Promise<AdminArtist> {
    const response = await firstValueFrom(
      this.http.patch<unknown>(`${this.base}/${id}/verification`, { verified }),
    )

    return adminArtistSchema.parse(response)
  }

  async softDelete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/${id}`))
  }
}
