import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { Page } from '@domain/shared'
import {
  type ListSupportConversationsQuery,
  type ReplyToSupportConversationInput,
  type SupportConversation,
  type SupportInboxItem,
  SupportInboxRepository,
} from '@domain/support'
import { ADMIN_API } from '../http/api.config'
import { toReadError } from '../http/to-read-error'
import { fetchPage } from '../http/wire-page'
import { supportConversationDto, supportPageDto } from './support.dto'
import { toSupportConversation, toSupportInboxItem, toSupportListFilters } from './support.mapper'

@Injectable()
export class HttpSupportInboxRepository extends SupportInboxRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/support/conversations`

  override list({
    page,
    limit,
    filter,
  }: ListSupportConversationsQuery): Promise<Page<SupportInboxItem>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: toSupportListFilters(filter),
      schema: supportPageDto,
      toDomain: toSupportInboxItem,
    })
  }

  override async getById(id: string): Promise<SupportConversation> {
    let response: unknown
    try {
      response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))
    } catch (error) {
      throw toReadError(error)
    }
    return toSupportConversation(supportConversationDto.parse(response))
  }

  override async reply({
    id,
    text,
  }: ReplyToSupportConversationInput): Promise<SupportConversation> {
    const response = await firstValueFrom(
      this.http.post<unknown>(`${this.base}/${id}/messages`, { text }),
    )
    return toSupportConversation(supportConversationDto.parse(response))
  }

  override async resolve(id: string): Promise<SupportConversation> {
    const response = await firstValueFrom(this.http.post<unknown>(`${this.base}/${id}/resolve`, {}))
    return toSupportConversation(supportConversationDto.parse(response))
  }
}
