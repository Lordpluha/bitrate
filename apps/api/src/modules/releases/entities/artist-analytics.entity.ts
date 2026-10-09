import { ApiProperty } from '@nestjs/swagger'

export class AnalyticsPeriodEntity {
  @ApiProperty({ type: String, format: 'date-time', description: 'Start of the first UTC day' })
  from: Date

  @ApiProperty({ type: String, format: 'date-time' })
  to: Date

  @ApiProperty({ enum: [7, 28, 90] })
  days: number

  @ApiProperty({ enum: ['UTC'] })
  timezone: 'UTC'
}

export class AnalyticsTotalsEntity {
  @ApiProperty({ minimum: 0 })
  plays: number

  @ApiProperty({ minimum: 0, description: 'Distinct signed-in listeners' })
  listeners: number
}

export class AnalyticsDayEntity {
  @ApiProperty({ example: '2026-10-09' })
  date: string

  @ApiProperty({ minimum: 0, description: 'An observed zero when no one played that day' })
  plays: number
}

export class AnalyticsTopTrackEntity {
  @ApiProperty({ format: 'uuid' })
  trackId: string

  @ApiProperty()
  title: string

  @ApiProperty({ minimum: 0 })
  plays: number

  @ApiProperty({ minimum: 0 })
  listeners: number
}

export class AnalyticsExternalSourceEntity {
  @ApiProperty({ enum: ['SPOTIFY', 'APPLE_MUSIC', 'YOUTUBE_MUSIC'] })
  source: string

  @ApiProperty({ enum: ['NOT_CONNECTED'] })
  state: 'NOT_CONNECTED'
}

export class ArtistAnalyticsEntity {
  @ApiProperty({
    enum: ['NO_TRACKS', 'NO_DATA_YET', 'READY'],
    enumName: 'ArtistAnalyticsState',
    description: 'NO_DATA_YET means nothing was ever played, which is not an observed zero',
  })
  state: 'NO_TRACKS' | 'NO_DATA_YET' | 'READY'

  @ApiProperty({ type: AnalyticsPeriodEntity })
  period: AnalyticsPeriodEntity

  @ApiProperty({ type: String, format: 'date-time', description: 'When the data was read' })
  freshness: Date

  @ApiProperty({ type: AnalyticsTotalsEntity, nullable: true })
  totals: AnalyticsTotalsEntity | null

  @ApiProperty({ type: AnalyticsTotalsEntity, nullable: true, description: 'The period before' })
  previous: AnalyticsTotalsEntity | null

  @ApiProperty({ type: [AnalyticsDayEntity] })
  daily: AnalyticsDayEntity[]

  @ApiProperty({ type: [AnalyticsTopTrackEntity], maxItems: 10 })
  topTracks: AnalyticsTopTrackEntity[]

  @ApiProperty({ type: [AnalyticsExternalSourceEntity] })
  external: AnalyticsExternalSourceEntity[]
}
