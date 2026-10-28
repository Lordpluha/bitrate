import { Button } from '@bitrate/ui-react'
import type { ArtistDashboard, DashboardAttention } from '@entities/dashboard'
import { useMusicCatalogue } from '@entities/music'
import {
  describeNotification,
  notificationTime,
  useNotifications,
} from '@entities/notification'
import {
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
  TrackPlayer,
} from '@entities/release'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CircleAlert,
  Music2,
} from 'lucide-react'
import { comingUp } from '../lib/comingUp'

const shortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  timeZone: 'UTC',
})
const plannedDate = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

interface DashboardOverviewProps {
  artistId: string
  dashboard: ArtistDashboard
}

/** Returning-artist dashboard in the designed decision order. */
export function DashboardOverview({
  artistId,
  dashboard,
}: DashboardOverviewProps) {
  return (
    <div className="artist-dash-grid">
      <CurrentRelease release={dashboard.currentRelease} />
      <Attention items={dashboard.attention} />
      <YourReleases artistId={artistId} counts={dashboard.counts} />
      <ComingUp dashboard={dashboard} />
      <RecentActivity artistId={artistId} />
      <ListeningData />
    </div>
  )
}

type CurrentReleaseData = NonNullable<ArtistDashboard['currentRelease']>

function nextStep(release: CurrentReleaseData) {
  switch (release.status) {
    case 'DRAFT':
      return release.blockerCount > 0
        ? {
            title: 'Finish preparing the release',
            detail: `${release.blockerCount} ${release.blockerCount === 1 ? 'step' : 'steps'} left before Bitrate review.`,
            label: 'Continue release',
          }
        : {
            title: 'Submit for Bitrate review',
            detail: 'Every required step is ready.',
            label: 'Review release',
          }
    case 'SUBMITTED':
      return {
        title: 'Waiting for Bitrate review',
        detail: 'You will be notified when a reviewer decides.',
        label: 'View review',
      }
    case 'REJECTED':
      return {
        title: 'Address the requested changes',
        detail: 'Bitrate asked for changes before approval.',
        label: 'Open feedback',
      }
    case 'READY':
      return {
        title: 'Publish on Bitrate',
        detail: 'Approved by Bitrate. Publish when you are ready.',
        label: 'Open release',
      }
    case 'SCHEDULED':
      return {
        title: 'Premiere scheduled',
        detail: 'Your release goes live on Bitrate at the premiere time.',
        label: 'Open release',
      }
    case 'PUBLISHING':
      return {
        title: 'Publishing on Bitrate',
        detail: 'Your tracks are being prepared for the player.',
        label: 'Open release',
      }
    case 'PUBLISH_FAILED':
      return {
        title: 'Publishing failed',
        detail: 'Bitrate has been notified and will retry.',
        label: 'Open release',
      }
    case 'RELEASED':
      return {
        title: 'Your release is live on Bitrate',
        detail: 'Share it and follow the first signals.',
        label: 'Open release',
      }
    case 'UNPUBLISHED':
      return {
        title: 'Your release is offline',
        detail: 'Listeners cannot play it until it is published again.',
        label: 'Open release',
      }
  }
}

function CurrentRelease({
  release,
}: {
  release: ArtistDashboard['currentRelease']
}) {
  if (!release)
    return (
      <section
        aria-labelledby="dashboard-current-heading"
        className="artist-release-workspace-panel artist-dash-wide"
      >
        <h2 id="dashboard-current-heading">Current release</h2>
        <p className="mt-3">No release in progress.</p>
      </section>
    )
  const step = nextStep(release)
  return (
    <section
      aria-labelledby="dashboard-current-heading"
      className="artist-release-workspace-panel artist-dash-wide artist-dash-current"
    >
      <h2 className="sr-only" id="dashboard-current-heading">
        Current release
      </h2>
      <div className="artist-dash-current-release">
        {release.cover ? (
          <img
            alt={`${release.title} artwork`}
            className="artist-dash-current-cover"
            src={releaseCoverUrl(release.cover)}
          />
        ) : (
          <div className="artist-dash-current-cover artist-release-cover-placeholder">
            <Music2 aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="artist-dash-current-title">{release.title}</p>
            <span className="artist-release-chip" data-status={release.status}>
              {releaseStatusLabels[release.status]}
            </span>
          </div>
          <p>
            {releaseTypeLabels[release.type]}
            {release.scheduledAt
              ? ` · Planned ${plannedDate.format(new Date(release.scheduledAt))}`
              : ' · No planned date'}
          </p>
          {release.leadTrack ? (
            <TrackPlayer
              className="mt-3"
              coverUrl={release.cover && releaseCoverUrl(release.cover)}
              releaseId={release.id}
              title={release.leadTrack.title}
              trackId={release.leadTrack.id}
            />
          ) : (
            <p className="artist-dash-current-empty">
              Upload a master to hear it here.
            </p>
          )}
        </div>
      </div>
      <div className="artist-dash-current-next">
        <h3>{step.title}</h3>
        <p>{step.detail}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button
            asChild
            className="artist-workspace-primary rounded-full"
            variant="primary"
          >
            <Link
              params={{ releaseId: release.id }}
              to="/dashboard/music/$releaseId"
            >
              <ArrowRight aria-hidden="true" className="size-4" />
              {step.label}
            </Link>
          </Button>
          <p>
            {release.status === 'RELEASED'
              ? 'Published on Bitrate'
              : 'Draft saved · Nothing is published yet'}
          </p>
        </div>
      </div>
    </section>
  )
}

function attentionCopy(item: DashboardAttention) {
  switch (item.kind) {
    case 'BLOCKERS':
      return {
        title: `${item.releaseTitle ?? 'A draft'} has ${item.count ?? 0} ${item.count === 1 ? 'blocker' : 'blockers'} before review`,
        detail: 'Required before review',
      }
    case 'CHANGES_REQUESTED':
      return {
        title: `${item.releaseTitle ?? 'A release'} needs changes after review`,
        detail: 'See review feedback',
      }
  }
}

function Attention({ items }: { items: ArtistDashboard['attention'] }) {
  return (
    <section
      aria-labelledby="dashboard-attention-heading"
      className="artist-release-workspace-panel artist-dash-attention"
      data-tone={items.length > 0 ? 'warning' : undefined}
    >
      <img
        alt=""
        aria-hidden="true"
        className="artist-dash-art"
        src="/artwork/dashboard/mastering-console.webp"
      />
      <div className="artist-dash-attention-head">
        <h2
          className="flex items-center gap-2"
          id="dashboard-attention-heading"
        >
          <CircleAlert aria-hidden="true" className="size-5" />
          Needs attention
        </h2>
        <span>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3">All clear. Nothing needs your attention.</p>
      ) : (
        <ul className="artist-dash-attention-list">
          {items.map((item) => {
            const copy = attentionCopy(item)
            const content = (
              <>
                <span className="min-w-0">
                  <span className="artist-release-row-title">{copy.title}</span>
                  <span>{copy.detail}</span>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </>
            )
            return (
              <li key={`${item.kind}-${item.releaseId ?? 'catalogue'}`}>
                {item.releaseId ? (
                  <Link
                    params={{ releaseId: item.releaseId }}
                    search={{
                      step:
                        item.kind === 'CHANGES_REQUESTED' ? 'review' : 'draft',
                    }}
                    to="/dashboard/music/$releaseId"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function YourReleases({
  artistId,
  counts,
}: {
  artistId: string
  counts: ArtistDashboard['counts']
}) {
  const releases = useMusicCatalogue(artistId, 'releases', {
    page: 1,
    sort: 'updated',
  })
  const rows =
    releases.data && 'data' in releases.data
      ? releases.data.data.filter((item) => 'trackCount' in item).slice(0, 3)
      : []
  return (
    <section
      aria-labelledby="dashboard-releases-heading"
      className="artist-release-workspace-panel artist-dash-wide"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="dashboard-releases-heading">Your releases</h2>
        <Link
          className="artist-dash-link"
          search={{ tab: 'releases', page: 1 }}
          to={ROUTES.dashboard.music}
        >
          View music
        </Link>
      </div>
      <p>
        Current catalog · {counts.releases}{' '}
        {counts.releases === 1 ? 'release' : 'releases'} · {counts.tracks}{' '}
        {counts.tracks === 1 ? 'track' : 'tracks'}
      </p>
      {releases.isPending ? (
        <p className="mt-3" role="status">
          Loading releases…
        </p>
      ) : releases.isError ? (
        <p className="mt-3" role="alert">
          Releases are unavailable right now.
        </p>
      ) : (
        <ul className="artist-dash-releases">
          {rows.map((release) => (
            <li key={release.id}>
              <Link
                params={{ releaseId: release.id }}
                to="/dashboard/music/$releaseId"
              >
                {release.cover ? (
                  <img alt="" src={releaseCoverUrl(release.cover)} />
                ) : (
                  <span className="artist-release-cover-placeholder">
                    <Music2 aria-hidden="true" />
                  </span>
                )}
                <span className="artist-release-row-title">
                  {release.title}
                </span>
                <span className="artist-dash-releases-type">
                  {releaseTypeLabels[release.type]}
                  {'trackCount' in release &&
                    ` · ${release.trackCount} ${release.trackCount === 1 ? 'track' : 'tracks'}`}
                </span>
                <span
                  className="artist-dash-releases-status"
                  data-status={release.status}
                >
                  {releaseStatusLabels[release.status]}
                </span>
                <ChevronRight aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ComingUp({ dashboard }: { dashboard: ArtistDashboard }) {
  const items = comingUp(dashboard.upcoming)
  return (
    <section
      aria-labelledby="dashboard-upcoming-heading"
      className="artist-release-workspace-panel"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="dashboard-upcoming-heading">Coming up</h2>
        <span className="text-xs text-text-secondary">UTC</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3">No dates yet. Plan a release date in a release.</p>
      ) : (
        <ol className="artist-dash-timeline">
          {items.map((item, index) => (
            <li data-first={index === 0} key={item.key}>
              <span className="artist-dash-timeline-date">
                {shortDate.format(new Date(item.at)).toUpperCase()}
              </span>
              <Link
                params={{ releaseId: item.releaseId }}
                to="/dashboard/music/$releaseId"
              >
                <span className="artist-release-row-title">{item.title}</span>
                <span>{item.detail}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function RecentActivity({ artistId }: { artistId: string }) {
  const notifications = useNotifications(artistId)
  const items = notifications.data?.data.slice(0, 3) ?? []
  return (
    <section
      aria-labelledby="dashboard-activity-heading"
      className="artist-release-workspace-panel artist-dash-wide"
    >
      <h2 id="dashboard-activity-heading">Recent activity</h2>
      {notifications.isPending ? (
        <p className="mt-3" role="status">
          Loading activity…
        </p>
      ) : items.length === 0 ? (
        <p className="mt-3">
          No activity yet. Reviews, deadlines and delivery updates appear here.
        </p>
      ) : (
        <ul className="artist-dash-activity">
          {items.map((item) => (
            <li key={item.id}>
              <Bell aria-hidden="true" />
              <Link
                params={{ releaseId: item.releaseId }}
                to="/dashboard/music/$releaseId"
              >
                {describeNotification(item)} · {item.releaseTitle}
              </Link>
              <span>{notificationTime(item.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Never shows zeroes for data Bitrate does not have yet. */
function ListeningData() {
  return (
    <section
      aria-labelledby="dashboard-analytics-heading"
      className="artist-release-workspace-panel artist-dash-listening"
    >
      <img
        alt=""
        aria-hidden="true"
        className="artist-dash-art"
        src="/artwork/dashboard/listening-spectrum.webp"
      />
      <h2 id="dashboard-analytics-heading">Listening data</h2>
      <p>Last 28 days</p>
      <p className="artist-dash-listening-note">
        Plays and listeners on Bitrate; external services are shown as not
        connected rather than zero.
      </p>
      <Link
        className="artist-dash-link"
        search={{ days: 28 }}
        to={ROUTES.dashboard.analytics}
      >
        Open analytics
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}
