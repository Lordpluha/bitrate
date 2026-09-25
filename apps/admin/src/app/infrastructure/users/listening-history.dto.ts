import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

type ContractListeningHistoryEntry = ApiSchemas['AdminListeningHistoryEntryEntity']

export const listeningHistoryEntryDto = z.object({
  id: z.uuid(),
  listenedAt: z.iso.datetime(),
  trackId: z.uuid(),
  trackTitle: z.string(),
  artistUsername: z.string(),
}) satisfies z.ZodType<ContractListeningHistoryEntry>

export type ListeningHistoryEntryDto = z.infer<typeof listeningHistoryEntryDto>

type ContractListeningHistoryPage = Omit<
  ApiSchemas['PaginatedAdminListeningHistoryEntity'],
  'data'
> & {
  data: ContractListeningHistoryEntry[]
}

export const listeningHistoryPageDto = z.object({
  data: z.array(listeningHistoryEntryDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractListeningHistoryPage>
