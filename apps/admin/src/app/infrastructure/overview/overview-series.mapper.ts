import type {
  OverviewListensPoint,
  OverviewReportsPoint,
  OverviewSeries,
  OverviewSignupsPoint,
  OverviewUploadsPoint,
} from '@domain/overview'
import type { OverviewSeriesDto } from './overview-series.dto'

function toUploadsPoint(dto: OverviewSeriesDto['uploads'][number]): OverviewUploadsPoint {
  return { ...dto, date: new Date(dto.date) }
}

function toSignupsPoint(dto: OverviewSeriesDto['signups'][number]): OverviewSignupsPoint {
  return { ...dto, date: new Date(dto.date) }
}

function toListensPoint(dto: OverviewSeriesDto['listens'][number]): OverviewListensPoint {
  return { ...dto, date: new Date(dto.date) }
}

function toReportsPoint(dto: OverviewSeriesDto['reports'][number]): OverviewReportsPoint {
  return { ...dto, date: new Date(dto.date) }
}

export function toOverviewSeries(dto: OverviewSeriesDto): OverviewSeries {
  return {
    from: new Date(dto.from),
    to: new Date(dto.to),
    days: dto.days,
    uploads: dto.uploads.map(toUploadsPoint),
    signups: dto.signups.map(toSignupsPoint),
    listens: dto.listens.map(toListensPoint),
    reports: dto.reports.map(toReportsPoint),
    reportsByStatus: dto.reportsByStatus,
  }
}
