import type { Permission } from '@domain/access'
import type { Overview } from '@domain/overview'
import { ROUTE_PERMISSIONS } from '@presentation/guards'

/**
 * Where a tile's count links to. Absent when no list on the panel can filter for it yet.
 * `permission` is the same permission the target route's own guard requires — read from
 * `ROUTE_PERMISSIONS` rather than duplicated here, so the two can't drift apart.
 */
export type OverviewTileLink = {
  path: string
  permission: Permission
  queryParams?: Record<string, string>
}

/** Looks up `path`'s guard permission in `ROUTE_PERMISSIONS` — every linked tile's target is guarded. */
function permissionFor(path: string): Permission {
  const route = ROUTE_PERMISSIONS.find((candidate) => candidate.path === path)
  if (!route) throw new Error(`No guarded route registered for "${path}"`)
  return route.permission
}

export type OverviewTile = {
  /** Stable key for `@for` tracking — not shown. */
  id: string
  label: string
  value: number
  /** A short qualifier shown under the value, e.g. the stuck threshold. */
  hint?: string
  link?: OverviewTileLink
}

/** Minutes, rounded, for the "stuck past N min" hint — `stuckAfterMs` is always a whole minute. */
function minutes(ms: number): number {
  return Math.round(ms / 60_000)
}

/**
 * The dashboard's tiles, in the order the operator scans a page: what needs a decision first
 * (reports, failing/stuck tracks), then account hygiene, then trailing activity.
 *
 * A tile only links where a target screen can actually filter for it today. `catalog` has no
 * "stuck" status — stuck is PROCESSING past a duration, not a status value — so that tile
 * renders as a plain count rather than a link to an unfiltered list.
 */
export function buildOverviewTiles(overview: Overview): OverviewTile[] {
  return [
    {
      id: 'reports-open',
      label: 'Open reports',
      value: overview.reports.open,
      /** `OPEN` is the moderation queue's own default status — omitted, per its codec. */
      link: { path: '/moderation', permission: permissionFor('/moderation') },
    },
    {
      id: 'reports-reviewing',
      label: 'Reports in review',
      value: overview.reports.reviewing,
      link: {
        path: '/moderation',
        permission: permissionFor('/moderation'),
        queryParams: { status: 'REVIEWING' },
      },
    },
    {
      id: 'tracks-failed',
      label: 'Failed tracks',
      value: overview.tracks.failed,
      link: {
        path: '/catalog',
        permission: permissionFor('/catalog'),
        queryParams: { status: 'FAILED' },
      },
    },
    {
      id: 'tracks-processing',
      label: 'Processing tracks',
      value: overview.tracks.processing,
      link: {
        path: '/catalog',
        permission: permissionFor('/catalog'),
        queryParams: { status: 'PROCESSING' },
      },
    },
    {
      id: 'tracks-stuck',
      label: 'Stuck tracks',
      value: overview.tracks.stuck,
      hint: `Past ${minutes(overview.tracks.stuckAfterMs)} min in processing`,
    },
    {
      id: 'deactivated-users',
      label: 'Deactivated listeners',
      value: overview.deactivated.users,
      link: {
        path: '/users',
        permission: permissionFor('/users'),
        queryParams: { status: 'deactivated' },
      },
    },
    {
      id: 'deactivated-artists',
      label: 'Deactivated artists',
      value: overview.deactivated.artists,
      link: {
        path: '/artists',
        permission: permissionFor('/artists'),
        queryParams: { status: 'deactivated' },
      },
    },
    {
      id: 'signups-7d',
      label: 'Signups, last 7 days',
      value: overview.last7Days.signups,
    },
    {
      id: 'uploads-7d',
      label: 'Uploads, last 7 days',
      value: overview.last7Days.uploads,
    },
  ]
}
