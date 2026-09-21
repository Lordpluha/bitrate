import { inject, Injectable } from '@angular/core'
import type { Page } from '@domain/shared'
import { type ListeningHistoryEntry, UserRepository } from '@domain/user'

export type ListListeningHistoryInput = {
  userId: string
  page: number
}

@Injectable({ providedIn: 'root' })
export class ListListeningHistoryUseCase {
  private readonly users = inject(UserRepository)

  execute({ userId, page }: ListListeningHistoryInput): Promise<Page<ListeningHistoryEntry>> {
    return this.users.listListeningHistory(userId, page)
  }
}
