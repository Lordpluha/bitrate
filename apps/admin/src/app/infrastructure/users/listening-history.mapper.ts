import type { ListeningHistoryEntry } from '@domain/user'
import type { ListeningHistoryEntryDto } from './listening-history.dto'

export function toListeningHistoryEntry(dto: ListeningHistoryEntryDto): ListeningHistoryEntry {
  return {
    id: dto.id,
    listenedAt: new Date(dto.listenedAt),
    trackId: dto.trackId,
    trackTitle: dto.trackTitle,
    artistUsername: dto.artistUsername,
  }
}
