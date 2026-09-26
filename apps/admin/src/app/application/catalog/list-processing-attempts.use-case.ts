import { inject, Injectable } from '@angular/core'
import type { Page } from '@domain/shared'
import { type ProcessingAttempt, TrackRepository } from '@domain/track'

export type ListProcessingAttemptsInput = {
  trackId: string
  page: number
}

@Injectable({ providedIn: 'root' })
export class ListProcessingAttemptsUseCase {
  private readonly tracks = inject(TrackRepository)

  execute({ trackId, page }: ListProcessingAttemptsInput): Promise<Page<ProcessingAttempt>> {
    return this.tracks.listProcessingAttempts(trackId, page)
  }
}
