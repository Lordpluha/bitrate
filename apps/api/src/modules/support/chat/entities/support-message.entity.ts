import { ApiProperty } from '@nestjs/swagger'
import type { SupportMessage } from '@prisma/client'
import { z } from 'zod'
import { ROLE_FROM_DB } from '../support-enum-maps'
import { SupportCitationEntity } from './support-citation.entity'

const citationsSchema = z.array(
  z.object({ chunkId: z.string(), title: z.string(), url: z.string().optional() }),
)

/** One message of a support conversation. */
export class SupportMessageEntity {
  @ApiProperty()
  id: string

  @ApiProperty({ enum: ['user', 'assistant', 'operator'] })
  role: 'user' | 'assistant' | 'operator'

  @ApiProperty()
  text: string

  /** Sources of an assistant answer; empty for other messages. */
  @ApiProperty({ type: [SupportCitationEntity] })
  citations: SupportCitationEntity[]

  @ApiProperty()
  createdAt: Date

  static from(row: SupportMessage): SupportMessageEntity {
    const citations = citationsSchema.safeParse(row.citations)
    return Object.assign(new SupportMessageEntity(), {
      id: row.id,
      role: ROLE_FROM_DB[row.role],
      text: row.text,
      citations: citations.success ? citations.data : [],
      createdAt: row.createdAt,
    })
  }
}
