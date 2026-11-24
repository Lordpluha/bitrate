import type { ApiSchemas } from '@bitrate/contracts/admin'
import * as z from 'zod'
import { contractEnum } from '../http/contract-union'

/** The unions as the API declares them. The domain declares its own; the mapper joins them. */
type Item = ApiSchemas['SupportInboxItemEntity']
export type WireSupportChannel = Item['channel']
export type WireSupportAudience = Item['audience']
export type WireSupportState = Item['state']
export type WireSupportTicketStatus = ApiSchemas['SupportTicketEntity']['status']
export type WireSupportRole = ApiSchemas['SupportMessageEntity']['role']

const channelDto = contractEnum<WireSupportChannel>()(['web', 'telegram', 'whatsapp', 'instagram'])
const audienceDto = contractEnum<WireSupportAudience>()(['listener', 'artist'])
const stateDto = contractEnum<WireSupportState>()([
  'bot',
  'waiting_operator',
  'operator',
  'resolved',
])
const ticketStatusDto = contractEnum<WireSupportTicketStatus>()(['open', 'resolved'])
const roleDto = contractEnum<WireSupportRole>()(['user', 'assistant', 'operator'])

const citationDto = z.object({
  chunkId: z.string(),
  title: z.string(),
  url: z.string().optional(),
}) satisfies z.ZodType<ApiSchemas['SupportCitationEntity']>

const messageDto = z.object({
  id: z.uuid(),
  role: roleDto,
  text: z.string(),
  citations: z.array(citationDto),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ApiSchemas['SupportMessageEntity']>

export type SupportMessageDto = z.infer<typeof messageDto>

const ticketDto = z.object({
  reason: z.string(),
  status: ticketStatusDto,
  createdAt: z.iso.datetime(),
  resolvedAt: z.iso.datetime().nullable(),
}) satisfies z.ZodType<ApiSchemas['SupportTicketEntity']>

export const supportItemDto = z.object({
  id: z.uuid(),
  audience: audienceDto,
  channel: channelDto,
  locale: z.string(),
  state: stateDto,
  userId: z.uuid().nullable(),
  ticket: ticketDto,
  lastMessage: messageDto.nullable(),
  lastMessageAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
})

/** `locale` stays a free string here: an unknown language must still render, not fail `parse`. */
type ContractItem = Omit<Item, 'locale'> & { locale: string }
supportItemDto satisfies z.ZodType<ContractItem>

export type SupportItemDto = z.infer<typeof supportItemDto>

export const supportConversationDto = supportItemDto.extend({ messages: z.array(messageDto) })

supportConversationDto satisfies z.ZodType<
  Omit<ApiSchemas['SupportInboxConversationEntity'], 'locale'> & { locale: string }
>

export type SupportConversationDto = z.infer<typeof supportConversationDto>

export const supportPageDto = z.object({
  data: z.array(supportItemDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<
  Omit<ApiSchemas['PaginatedSupportInboxEntity'], 'data'> & { data: ContractItem[] }
>
