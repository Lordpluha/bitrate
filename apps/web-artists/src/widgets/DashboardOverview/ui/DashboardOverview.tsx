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
import { type I18n, useI18n } from '@shared/i18n'
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

function nextStep(
  release: CurrentReleaseData,
  { t, tp }: Pick<I18n, 't' | 'tp'>,
) {
  const open = t('music.create.open')
  switch (release.status) {
    case 'DRAFT':
      return release.blockerCount > 0
        ? {
            title: t('dashboard.next.prepare'),
            detail: tp({
              count: release.blockerCount,
              key: 'dashboard.next.stepsLeft',
            }),
            label: t('dashboard.next.continue'),
          }
        : {
            title: t('workspace.next.submit'),
            detail: t('dashboard.next.ready'),
            label: t('dashboard.next.review'),
          }
    case 'SUBMITTED':
      return {
        title: t('dashboard.next.waiting'),
        detail: t('dashboard.next.waitingDescription'),
        label: t('workspace.next.viewReview'),
      }
    case 'REJECTED':
      return {
        title: t('workspace.next.rejected'),
        detail: t('workspace.next.rejectedDescription'),
        label: t('workspace.next.openFeedback'),
      }
    case 'READY':
      return {
        title: t('workspace.next.ready'),
        detail: t('workspace.next.readyDescription'),
        label: open,
      }
    case 'SCHEDULED':
      return {
        title: t('workspace.next.scheduled'),
        detail: t('workspace.next.scheduledDescription'),
        label: open,
      }
    case 'PUBLISHING':
      return {
        title: t('workspace.next.publishing'),
        detail: t('workspace.next.publishingDescription'),
        label: open,
      }
    case 'PUBLISH_FAILED':
      return {
        title: t('workspace.next.failed'),
        detail: t('workspace.next.failedDescription'),
        label: open,
      }
    case 'RELEASED':
      return {
        title: t('workspace.next.released'),
        detail: t('workspace.next.releasedDescription'),
        label: open,
      }
    case 'UNPUBLISHED':
      return {
        title: t('workspace.next.unpublished'),
        detail: t('workspace.next.unpublishedDescription'),
        label: open,
      }
  }
}

function CurrentRelease({
  release,
}: {
  release: ArtistDashboard['currentRelease']
}) {
  const i18n = useI18n()
  const { t, locale } = i18n
  if (!release)
    return (
      <section
        aria-labelledby="dashboard-current-heading"
        className="artist-release-workspace-panel artist-dash-wide"
      >
        <h2 id="dashboard-current-heading">{t('dashboard.current')}</h2>
        <p className="mt-3">{t('dashboard.noCurrent')}</p>
      </section>
    )
  const step = nextStep(release, i18n)
  return (
    <section
      aria-labelledby="dashboard-current-heading"
      className="artist-release-workspace-panel artist-dash-wide artist-dash-current"
    >
      <h2 className="sr-only" id="dashboard-current-heading">
        {t('dashboard.current')}
      </h2>
      <div className="artist-dash-current-release">
        {release.cover ? (
          <img
            alt={t('workspace.artworkAlt', { title: release.title })}
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
              {t(releaseStatusLabels[release.status])}
            </span>
          </div>
          <p>
            {t(releaseTypeLabels[release.type])}
            {release.scheduledAt
              ? ` · ${t('dashboard.planned', {
                  date: new Intl.DateTimeFormat(locale, {
                    dateStyle: 'medium',
                    timeZone: 'UTC',
                  }).format(new Date(release.scheduledAt)),
                })}`
              : ` · ${t('dashboard.noPlannedDate')}`}
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
              {t('dashboard.uploadMaster')}
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
              ? t('dashboard.published')
              : t('dashboard.draftSaved')}
          </p>
        </div>
      </div>
    </section>
  )
}

function attentionCopy(
  item: DashboardAttention,
  { t, tp }: Pick<I18n, 't' | 'tp'>,
) {
  switch (item.kind) {
    case 'BLOCKERS':
      return {
        title: tp({
          count: item.count ?? 0,
          key: 'dashboard.attention.blockers',
          values: {
            title: item.releaseTitle ?? t('dashboard.attention.aDraft'),
          },
        }),
        detail: t('dashboard.attention.requiredBefore'),
      }
    case 'CHANGES_REQUESTED':
      return {
        title: t('dashboard.attention.changes', {
          title: item.releaseTitle ?? t('dashboard.attention.aRelease'),
        }),
        detail: t('dashboard.attention.feedback'),
      }
  }
}

function Attention({ items }: { items: ArtistDashboard['attention'] }) {
  const i18n = useI18n()
  const { t } = i18n
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
          {t('dashboard.attention.title')}
        </h2>
        <span>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3">{t('dashboard.attention.clear')}</p>
      ) : (
        <ul className="artist-dash-attention-list">
          {items.map((item) => {
            const copy = attentionCopy(item, i18n)
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
  const { t, tp } = useI18n()
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
        <h2 id="dashboard-releases-heading">{t('music.table.yourReleases')}</h2>
        <Link
          className="artist-dash-link"
          search={{ tab: 'releases', page: 1 }}
          to={ROUTES.dashboard.music}
        >
          {t('dashboard.releases.viewMusic')}
        </Link>
      </div>
      <p>
        {t('dashboard.releases.catalog', {
          releases: tp({ count: counts.releases, key: 'music.releases' }),
          tracks: tp({ count: counts.tracks, key: 'common.tracks' }),
        })}
      </p>
      {releases.isPending ? (
        <p className="mt-3" role="status">
          {t('dashboard.releases.loading')}
        </p>
      ) : releases.isError ? (
        <p className="mt-3" role="alert">
          {t('dashboard.releases.unavailable')}
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
                  {t(releaseTypeLabels[release.type])}
                  {'trackCount' in release &&
                    ` · ${tp({ count: release.trackCount, key: 'common.tracks' })}`}
                </span>
                <span
                  className="artist-dash-releases-status"
                  data-status={release.status}
                >
                  {t(releaseStatusLabels[release.status])}
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
  const { t, locale } = useI18n()
  const items = comingUp(dashboard.upcoming)
  const shortDate = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  })
  return (
    <section
      aria-labelledby="dashboard-upcoming-heading"
      className="artist-release-workspace-panel"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="dashboard-upcoming-heading">{t('dashboard.upcoming.title')}</h2>
        <span className="text-xs text-text-secondary">UTC</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3">{t('dashboard.upcoming.empty')}</p>
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
                <span className="artist-release-row-title">
                  {t(item.title)}
                </span>
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
  const i18n = useI18n()
  const { t } = i18n
  const items = notifications.data?.data.slice(0, 3) ?? []
  return (
    <section
      aria-labelledby="dashboard-activity-heading"
      className="artist-release-workspace-panel artist-dash-wide"
    >
      <h2 id="dashboard-activity-heading">{t('dashboard.activity.title')}</h2>
      {notifications.isPending ? (
        <p className="mt-3" role="status">
          {t('dashboard.activity.loading')}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-3">{t('dashboard.activity.empty')}</p>
      ) : (
        <ul className="artist-dash-activity">
          {items.map((item) => (
            <li key={item.id}>
              <Bell aria-hidden="true" />
              <Link
                params={{ releaseId: item.releaseId }}
                to="/dashboard/music/$releaseId"
              >
                {describeNotification(item, i18n)} · {item.releaseTitle}
              </Link>
              <span>{notificationTime(item.at, i18n)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Never shows zeroes for data Bitrate does not have yet. */
function ListeningData() {
  const { t } = useI18n()
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
      <h2 id="dashboard-analytics-heading">{t('dashboard.listening.title')}</h2>
      <p>{t('dashboard.listening.period')}</p>
      <p className="artist-dash-listening-note">
        {t('dashboard.listening.note')}
      </p>
      <Link
        className="artist-dash-link"
        search={{ days: 28 }}
        to={ROUTES.dashboard.analytics}
      >
        {t('dashboard.listening.open')}
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}
