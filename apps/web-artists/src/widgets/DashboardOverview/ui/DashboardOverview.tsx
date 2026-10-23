import { Button, cn } from '@bitrate/ui-react'
import type { ArtistDashboard, DashboardAttention } from '@entities/dashboard'
import {
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { formatDue, isOverdue } from '@entities/task'
import { formatDateTimeUtc } from '@shared/lib/date'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  CalendarDays,
  CircleAlert,
  Disc3,
  ListChecks,
  Music2,
} from 'lucide-react'

interface DashboardOverviewProps {
  dashboard: ArtistDashboard
}

/** Returning-artist dashboard in the designed decision order. */
export function DashboardOverview({ dashboard }: DashboardOverviewProps) {
  return (
    <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-3">
      <CurrentRelease release={dashboard.currentRelease} />
      <Attention items={dashboard.attention} />
      <Tasks tasks={dashboard.tasks} />
      <Catalogue counts={dashboard.counts} />
      <Upcoming upcoming={dashboard.upcoming} />
      <Analytics />
    </div>
  )
}

type CurrentReleaseSummary = NonNullable<ArtistDashboard['currentRelease']>

/** What the current release is waiting on, in the artist's words. */
function currentReleaseText({ status, blockerCount }: CurrentReleaseSummary) {
  switch (status) {
    case 'DRAFT':
      return blockerCount > 0
        ? `${blockerCount} ${blockerCount === 1 ? 'step' : 'steps'} left before review`
        : 'Ready to submit for review'
    case 'SUBMITTED':
      return 'Waiting for Bitrate review'
    case 'REJECTED':
      return 'Changes requested by the reviewer'
    default:
      return 'Nothing to do right now'
  }
}

function CurrentRelease({
  release,
}: {
  release: ArtistDashboard['currentRelease']
}) {
  return (
    <section
      aria-labelledby="dashboard-current-heading"
      className="artist-release-workspace-panel lg:col-span-2"
    >
      <h2 id="dashboard-current-heading">Current release</h2>
      {release ? (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {release.cover ? (
            <img
              alt={`${release.title} artwork`}
              className="size-24 shrink-0 rounded-lg border border-border object-cover"
              src={releaseCoverUrl(release.cover)}
            />
          ) : (
            <div className="flex size-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-border">
              <Music2 aria-hidden="true" className="size-8 text-accent" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-lg">{release.title}</p>
            <p className="text-sm text-text-secondary">
              {releaseTypeLabels[release.type]} ·{' '}
              {releaseStatusLabels[release.status]}
              {release.scheduledAt &&
                ` · Planned ${formatDateTimeUtc(release.scheduledAt)} UTC`}
            </p>
            <p
              className={cn(
                'text-sm',
                release.blockerCount > 0
                  ? 'text-destructive'
                  : 'text-text-secondary',
              )}
            >
              {currentReleaseText(release)}
            </p>
          </div>
          <Button
            asChild
            className="artist-workspace-primary rounded-full"
            variant="primary"
          >
            <Link
              params={{ releaseId: release.id }}
              to="/dashboard/music/$releaseId"
            >
              Open workspace
            </Link>
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-secondary">
          No release in progress.
        </p>
      )}
    </section>
  )
}

function attentionText(item: DashboardAttention) {
  switch (item.kind) {
    case 'BLOCKERS':
      return `${item.releaseTitle ?? 'A draft'} has ${item.count ?? 0} ${item.count === 1 ? 'blocker' : 'blockers'} before review`
    case 'CHANGES_REQUESTED':
      return `${item.releaseTitle ?? 'A release'} needs changes after review`
    case 'OVERDUE_TASKS':
      return `${item.count ?? 0} ${item.count === 1 ? 'task is' : 'tasks are'} overdue`
  }
}

function Attention({ items }: { items: ArtistDashboard['attention'] }) {
  return (
    <section
      aria-labelledby="dashboard-attention-heading"
      className="artist-release-workspace-panel"
    >
      <h2 id="dashboard-attention-heading">Needs attention</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">
          All clear. Nothing needs your attention.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li
              className="flex items-start gap-2 text-sm"
              key={`${item.kind}-${item.releaseId ?? 'tasks'}`}
            >
              <CircleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              {item.releaseId ? (
                <Link
                  className="underline"
                  params={{ releaseId: item.releaseId }}
                  to="/dashboard/music/$releaseId"
                >
                  {attentionText(item)}
                </Link>
              ) : (
                <Link
                  className="underline"
                  search={{ status: 'OPEN', page: 1 }}
                  to={ROUTES.dashboard.tasks}
                >
                  {attentionText(item)}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Tasks({ tasks }: { tasks: ArtistDashboard['tasks'] }) {
  return (
    <section
      aria-labelledby="dashboard-tasks-heading"
      className="artist-release-workspace-panel lg:col-span-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="dashboard-tasks-heading">
          Next tasks <span>({tasks.open} open)</span>
        </h2>
        <Link
          className="text-sm underline"
          search={{ status: 'OPEN', page: 1 }}
          to={ROUTES.dashboard.tasks}
        >
          All tasks
        </Link>
      </div>
      {tasks.next.length === 0 ? (
        <div className="mt-3 flex items-start gap-2 text-sm text-text-secondary">
          <ListChecks aria-hidden="true" className="size-4 shrink-0" />
          <p>No open tasks. Add them from a release workspace.</p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {tasks.next.map((task) => {
            const overdue = isOverdue(task)
            return (
              <li className="flex flex-wrap gap-x-4 gap-y-1 py-2" key={task.id}>
                <span className="min-w-0 flex-1 text-sm">{task.title}</span>
                <Link
                  className="text-sm text-text-secondary underline"
                  params={{ releaseId: task.release.id }}
                  to="/dashboard/music/$releaseId"
                >
                  {task.release.title}
                </Link>
                <span
                  className={cn(
                    'text-sm',
                    overdue ? 'text-destructive' : 'text-text-secondary',
                  )}
                >
                  {task.dueAt
                    ? `${overdue ? 'Overdue · ' : 'Due '}${formatDue(task.dueAt)}`
                    : 'No deadline'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Catalogue({ counts }: { counts: ArtistDashboard['counts'] }) {
  const items = [
    ['Releases', counts.releases],
    ['Drafts', counts.drafts],
    ['In review', counts.inReview],
    ['Released', counts.released],
    ['Tracks', counts.tracks],
  ] as const
  return (
    <section
      aria-labelledby="dashboard-catalogue-heading"
      className="artist-release-workspace-panel"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="dashboard-catalogue-heading">Catalogue</h2>
        <Disc3 aria-hidden="true" className="size-5 text-accent" />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-text-secondary">{label}</dt>
            <dd className="text-xl">{value}</dd>
          </div>
        ))}
      </dl>
      <Link
        className="mt-3 inline-block text-sm underline"
        search={{ tab: 'releases', page: 1 }}
        to={ROUTES.dashboard.music}
      >
        Open Music
      </Link>
    </section>
  )
}

function Upcoming({ upcoming }: { upcoming: ArtistDashboard['upcoming'] }) {
  return (
    <section
      aria-labelledby="dashboard-upcoming-heading"
      className="artist-release-workspace-panel lg:col-span-2"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="dashboard-upcoming-heading">Upcoming dates</h2>
        <CalendarDays aria-hidden="true" className="size-5 text-accent" />
      </div>
      {upcoming.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">
          No planned dates. Set one with Edit schedule in a release workspace.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {upcoming.map((release) => (
            <li className="flex flex-wrap gap-x-4 text-sm" key={release.id}>
              <Link
                className="min-w-0 flex-1 underline"
                params={{ releaseId: release.id }}
                to="/dashboard/music/$releaseId"
              >
                {release.title}
              </Link>
              <span className="text-text-secondary">
                {formatDateTimeUtc(release.scheduledAt)} UTC ·{' '}
                {releaseStatusLabels[release.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Never shows zeroes for data Bitrate does not have yet. */
function Analytics() {
  return (
    <section
      aria-labelledby="dashboard-analytics-heading"
      className="artist-release-workspace-panel"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="dashboard-analytics-heading">Analytics</h2>
        <BarChart3 aria-hidden="true" className="size-5 text-accent" />
      </div>
      <p className="mt-3 text-sm text-text-secondary">
        Plays and listeners on Bitrate, with external services shown as not
        connected rather than zero.
      </p>
      <Link
        className="mt-3 inline-block text-sm underline"
        search={{ days: 28 }}
        to={ROUTES.dashboard.analytics}
      >
        Open analytics
      </Link>
    </section>
  )
}
