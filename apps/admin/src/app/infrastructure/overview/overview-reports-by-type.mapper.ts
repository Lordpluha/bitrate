import type { ModerationEntityType } from '@domain/moderation'
import type { OverviewReportsByType } from '@domain/overview'
import type { OverviewReportsByTypeDto } from './overview-reports-by-type.dto'

type WireEntityType = OverviewReportsByTypeDto['series'][number]['entityType']

/**
 * `null` marks a type the API still reports but the panel retired (ADR-0066); its series is
 * dropped. Those keys go when the API removes them from the contract, which fails to compile here.
 */
const TO_DOMAIN_ENTITY_TYPE = {
  track: 'track',
  album: 'album',
  playlist: 'playlist',
  artist: 'artist',
  podcast: null,
  episode: null,
  user: 'user',
} as const satisfies Record<WireEntityType, ModerationEntityType | null>

export function toOverviewReportsByType(dto: OverviewReportsByTypeDto): OverviewReportsByType {
  return {
    from: new Date(dto.from),
    to: new Date(dto.to),
    days: dto.days,
    dates: dto.dates.map((date) => new Date(date)),
    series: dto.series.flatMap(({ entityType, counts, total }) => {
      const type = TO_DOMAIN_ENTITY_TYPE[entityType]
      return type === null ? [] : [{ entityType: type, counts, total }]
    }),
    total: dto.total,
  }
}
