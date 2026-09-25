import type { Permission } from '@domain/access'
import type { Overview } from '@domain/overview'
import { ROUTE_PERMISSIONS } from '@presentation/guards'

/**
 * Where a status item's count links to. Absent when no list on the panel can filter for it yet.
 * `permission` is the same permission the target route's own guard requires — read from
 * `ROUTE_PERMISSIONS` rather than duplicated here, so the two can't drift apart.
 */
export type OverviewStatusItemLink = {
  path: string
  permission: Permission
  queryParams?: Record<string, string>
}

/** Looks up `path`'s guard permission in `ROUTE_PERMISSIONS` — every linked item's target is guarded. */
function permissionFor(path: string): Permission {
  const route = ROUTE_PERMISSIONS.find((candidate) => candidate.path === path)
  if (!route) throw new Error(`No guarded route registered for "${path}"`)
  return route.permission
}

/**
 * One current-state count, rendered inline on a chart card by `OverviewStatusStrip` — never as
 * its own tile. These are counts a time series can't carry: a snapshot (open reports) or a
 * threshold breach (stuck tracks), not a per-day value.
 */
export type OverviewStatusItem = {
  /** Stable key for `@for` tracking, and for `OverviewStatusStrip`'s `urgentId` match. */
  id: string
  label: string
  value: number
  /** A short qualifier shown under the value, e.g. the stuck threshold. */
  hint?: string
  link?: OverviewStatusItemLink
}

/** Minutes, rounded, for the "stuck past N min" hint — `stuckAfterMs` is always a whole minute. */
function minutes(ms: number): number {
  return Math.round(ms / 60_000)
}

/**
 * The track pipeline's current state, attached to the "Uploads by outcome" chart card: what's
 * failed and needs a look, what's still processing, and — last, meant to stand out — what's
 * stuck past the threshold and needs a decision right now.
 *
 * `catalog` has no "stuck" status of its own — stuck is PROCESSING past a duration, not a status
 * value — so that item renders as a plain count rather than a link to an unfiltered list.
 */
export function buildTrackPipelineStatus(overview: Overview): OverviewStatusItem[] {
  return [
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
      label: 'Processing',
      value: overview.tracks.processing,
      link: {
        path: '/catalog',
        permission: permissionFor('/catalog'),
        queryParams: { status: 'PROCESSING' },
      },
    },
    {
      id: 'tracks-stuck',
      label: 'Stuck',
      value: overview.tracks.stuck,
      hint: `Past ${minutes(overview.tracks.stuckAfterMs)} min in processing`,
    },
  ]
}

/**
 * The moderation queue's current state, attached to the "Reports by current status" chart card —
 * the same counts that chart's "Open"/"Reviewing" bars already draw, given a clickable home.
 */
export function buildReportsStatus(overview: Overview): OverviewStatusItem[] {
  return [
    {
      id: 'reports-open',
      label: 'Open',
      value: overview.reports.open,
      /** `OPEN` is the moderation queue's own default status — omitted, per its codec. */
      link: { path: '/moderation', permission: permissionFor('/moderation') },
    },
    {
      id: 'reports-reviewing',
      label: 'In review',
      value: overview.reports.reviewing,
      link: {
        path: '/moderation',
        permission: permissionFor('/moderation'),
        queryParams: { status: 'REVIEWING' },
      },
    },
  ]
}

/**
 * Deactivated account counts, attached to the "New accounts per day" chart card — the other end
 * of that chart's account-lifecycle story.
 */
export function buildAccountDeactivationStatus(overview: Overview): OverviewStatusItem[] {
  return [
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
  ]
}
