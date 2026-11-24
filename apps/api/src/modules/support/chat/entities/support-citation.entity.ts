import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** A knowledge source shown under an assistant answer. */
export class SupportCitationEntity {
  /** Stable id of the article chunk the answer drew on. */
  @ApiProperty()
  chunkId: string

  @ApiProperty()
  title: string

  /** Public page of the source, when it has one. */
  @ApiPropertyOptional()
  url?: string
}
