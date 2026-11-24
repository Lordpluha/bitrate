import { inject, Injectable } from '@angular/core'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'
import {
  type SupportInboxFilter,
  type SupportInboxItem,
  SupportInboxRepository,
} from '@domain/support'

export type ListSupportConversationsInput = {
  page: number
  filter?: SupportInboxFilter
}

@Injectable({ providedIn: 'root' })
export class ListSupportConversationsUseCase {
  private readonly inbox = inject(SupportInboxRepository)

  execute({ page, filter = {} }: ListSupportConversationsInput): Promise<Page<SupportInboxItem>> {
    return this.inbox.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
