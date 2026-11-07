import { ApiProperty } from '@nestjs/swagger'
import { ReleaseEntity } from './release.entity'

export class CompilationRecordingEntity {
  @ApiProperty({ format: 'uuid' })
  id: string
  @ApiProperty()
  title: string
  @ApiProperty({ type: Number, nullable: true })
  duration: number | null
  @ApiProperty({ type: String, nullable: true })
  isrc: string | null
  @ApiProperty({ type: String, nullable: true })
  cover: string | null
}
export class CompilationCatalogueEntity {
  @ApiProperty({ type: [CompilationRecordingEntity] })
  data: CompilationRecordingEntity[]
  @ApiProperty()
  total: number
  @ApiProperty()
  page: number
  @ApiProperty()
  limit: number
}
export class CompilationTracksAddedEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity
  @ApiProperty({ type: [String], format: 'uuid' })
  trackIds: string[]
}
