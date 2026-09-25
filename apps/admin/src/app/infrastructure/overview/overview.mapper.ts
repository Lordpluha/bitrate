import type { Overview } from '@domain/overview'
import { toAuditEntry } from '../audit/audit.mapper'
import type { OverviewDto } from './overview.dto'

export function toOverview(dto: OverviewDto): Overview {
  return {
    reports: dto.reports,
    tracks: dto.tracks,
    deactivated: dto.deactivated,
    last7Days: dto.last7Days,
    recentActivity: dto.recentActivity.map(toAuditEntry),
  }
}
