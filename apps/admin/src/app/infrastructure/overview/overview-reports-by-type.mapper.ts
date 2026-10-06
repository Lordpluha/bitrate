import type { OverviewReportsByType } from '@domain/overview'
import type { OverviewReportsByTypeDto } from './overview-reports-by-type.dto'

export function toOverviewReportsByType(dto: OverviewReportsByTypeDto): OverviewReportsByType {
  return {
    from: new Date(dto.from),
    to: new Date(dto.to),
    days: dto.days,
    dates: dto.dates.map((date) => new Date(date)),
    series: dto.series,
    total: dto.total,
  }
}
