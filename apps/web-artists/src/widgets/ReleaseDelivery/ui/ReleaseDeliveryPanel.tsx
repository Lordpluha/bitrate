import { Button } from '@bitrate/ui-react'
import {
  availabilityLabels,
  type DestinationAvailability,
  plannedSummary,
  territorySummary,
  useReleaseDelivery,
} from '@entities/delivery'
import type { ReleaseWorkspace } from '@entities/release'
import { DeliveryPlanDialog } from '@features/delivery-plan'
import { destinationLabels } from '@shared/constants/destinations'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { LockedButton } from '@shared/ui'
import {
  CalendarDays,
  CircleCheck,
  CircleDashed,
  CircleSlash,
  Clock,
  Globe2,
  Info,
  Radio,
  Send,
} from 'lucide-react'
import { useState } from 'react'

type Status = ReleaseWorkspace['status']

/** Live once: the release reached listeners, whether or not it is online now. */
const wentLive = (status: Status) =>
  status === 'RELEASED' || status === 'UNPUBLISHED'

/** Publishing has started; timing and plan are settled. */
const publishing = (status: Status) =>
  status === 'SCHEDULED' ||
  status === 'PUBLISHING' ||
  status === 'PUBLISH_FAILED'

/** Why the plan cannot change in `status`; drafts and approved releases can always plan. */
function planLockReason(status: Status): TranslationKey | null {
  if (status === 'DRAFT' || status === 'READY') return null
  if (wentLive(status)) return 'delivery.lock.planLive'
  if (publishing(status)) return 'delivery.lock.planPublishing'
  return status === 'REJECTED'
    ? 'delivery.lock.planRejected'
    : 'delivery.lock.planReview'
}

/** The timing stays editable in the draft and after approval, until publishing starts. */
function scheduleLockReason(status: Status): TranslationKey | null {
  if (status === 'DRAFT' || status === 'READY') return null
  if (wentLive(status)) return 'delivery.lock.scheduleLive'
  if (publishing(status)) return 'delivery.lock.schedulePublishing'
  return status === 'REJECTED'
    ? 'delivery.lock.scheduleRejected'
    : 'delivery.lock.scheduleReview'
}

/** Live and failed carry meaning; everything else stays neutral so nothing looks sent. */
const tone: Record<DestinationAvailability, string | undefined> = {
  NOT_CONNECTED: 'warning',
  UNAVAILABLE: undefined,
  NOT_SENT: undefined,
  PENDING: 'info',
  LIVE: 'success',
  FAILED: 'error',
  TAKEN_DOWN: undefined,
}

const icons: Record<DestinationAvailability, typeof Radio> = {
  NOT_CONNECTED: Radio,
  UNAVAILABLE: CircleSlash,
  NOT_SENT: CircleDashed,
  PENDING: Clock,
  LIVE: CircleCheck,
  FAILED: CircleSlash,
  TAKEN_DOWN: CircleSlash,
}

interface ReleaseDeliveryPanelProps {
  artistId: string
  releaseId: string
  /** The release version the plan is edited against, and its planned date. */
  release: { status: Status; updatedAt: string; scheduledAt: string | null }
  onSchedule: () => void
}

/** Stage 4: when and where the release goes; states plainly that nothing has been sent. */
export function ReleaseDeliveryPanel({
  artistId,
  releaseId,
  release,
  onSchedule,
}: ReleaseDeliveryPanelProps) {
  const i18n = useI18n()
  const { t, tMessage, locale } = i18n
  const delivery = useReleaseDelivery(artistId, releaseId)
  const [editing, setEditing] = useState(false)
  const lock = planLockReason(release.status)
  const scheduleLock = scheduleLockReason(release.status)
  const approved = release.status === 'READY' || release.status === 'RELEASED'

  if (delivery.isPending)
    return (
      <section
        aria-labelledby="release-delivery-heading"
        className="artist-release-workspace-panel"
      >
        <h2 id="release-delivery-heading">{t('delivery.title')}</h2>
        <p role="status">{t('delivery.loading')}</p>
      </section>
    )
  if (delivery.isError)
    return (
      <section
        aria-labelledby="release-delivery-heading"
        className="artist-release-workspace-panel space-y-2"
      >
        <h2 id="release-delivery-heading">{t('delivery.title')}</h2>
        <p role="alert">{tMessage(delivery.error.message)}</p>
        <Button
          onClick={() => {
            void delivery.refetch()
          }}
          size="sm"
          variant="outline"
        >
          {t('common.tryAgain')}
        </Button>
      </section>
    )

  const plan = delivery.data
  const storeCount = plan.destinations.filter((item) => item.planned).length
  const checks = [
    { done: approved, label: t('delivery.check.approved') },
    {
      done: true,
      label: release.scheduledAt
        ? t('delivery.check.premiere', {
            date: formatDateTimeUtc(release.scheduledAt, locale),
          })
        : t('delivery.check.rightAway'),
    },
    {
      done: storeCount > 0,
      label:
        storeCount > 0
          ? plannedSummary(plan, i18n)
          : t('delivery.check.noStores'),
    },
  ]

  return (
    <div className="artist-release-stage">
      <div className="artist-release-stage-main grid content-start gap-4">
        <section
          aria-labelledby="release-timing-heading"
          className="artist-release-workspace-panel"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="release-timing-heading">{t('release.roadmap.timing')}</h2>
            {scheduleLock ? (
              <LockedButton
                reason={t(scheduleLock)}
                size="sm"
                variant="outline"
              >
                {t('delivery.editSchedule')}
              </LockedButton>
            ) : (
              <Button onClick={onSchedule} size="sm" variant="outline">
                {t('delivery.editSchedule')}
              </Button>
            )}
          </div>
          <p>{t('delivery.timingIntro')}</p>
          <dl className="artist-release-fact-grid">
            <div data-done={true}>
              <dt>
                <span aria-hidden="true" className="artist-release-fact-icon">
                  <CalendarDays />
                </span>
                {t('editRelease.releaseDate')}
              </dt>
              <dd>
                {release.scheduledAt
                  ? t('delivery.dateUtc', {
                      date: formatDateTimeUtc(release.scheduledAt, locale),
                    })
                  : t('editRelease.rightAway')}
              </dd>
              <dd className="artist-release-fact-hint">
                {release.scheduledAt
                  ? t('delivery.premiereHint')
                  : t('editRelease.rightAwayHint')}
              </dd>
            </div>
            <div data-done={true}>
              <dt>
                <span aria-hidden="true" className="artist-release-fact-icon">
                  <Globe2 />
                </span>
                {t('delivery.territories')}
              </dt>
              <dd>{territorySummary(plan, i18n)}</dd>
              <dd className="artist-release-fact-hint">
                {t('delivery.territoriesHint')}
              </dd>
            </div>
          </dl>
        </section>
        <section
          aria-labelledby="release-delivery-heading"
          className="artist-release-workspace-panel artist-release-destinations"
        >
          <img
            alt=""
            aria-hidden="true"
            className="artist-release-destinations-art"
            src="/artwork/releases/state-patchbay-v1.webp"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="release-delivery-heading">{t('delivery.destinations')}</h2>
            <span className="text-xs text-text-secondary">
              {t('delivery.plannedCount', {
                planned: storeCount,
                total: plan.destinations.length,
              })}
            </span>
          </div>
          <dl className="sr-only">
            <dt>{t('delivery.stores')}</dt>
            <dd>{plannedSummary(plan, i18n)}</dd>
          </dl>
          <ul className="artist-release-rows">
            {plan.destinations.map((item) => {
              const Icon = icons[item.availability]
              return (
                <li data-planned={item.planned} key={item.destination}>
                  <Icon aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="artist-release-row-title">
                      {destinationLabels[item.destination]}
                    </span>
                    <span>
                      {item.message ??
                        (item.planned
                          ? t('delivery.inPlan')
                          : t('delivery.notInPlan'))}
                    </span>
                  </span>
                  <span
                    className="artist-release-chip"
                    data-tone={tone[item.availability]}
                  >
                    {t(availabilityLabels[item.availability])}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
      <section
        aria-labelledby="release-delivery-next-heading"
        className="artist-release-workspace-panel artist-release-stage-side"
      >
        <h2 id="release-delivery-next-heading">
          {t('delivery.beforeContinue')}
        </h2>
        <ul className="artist-release-summary-list">
          {checks.map((check) => (
            <li data-done={check.done} key={check.label}>
              {check.done ? (
                <CircleCheck aria-hidden="true" />
              ) : (
                <CircleDashed aria-hidden="true" />
              )}
              <span>{check.label}</span>
            </li>
          ))}
        </ul>
        <p className="artist-release-eyebrow mt-5">
          {t('workspace.header.nextAction')}
        </p>
        <p className="artist-release-side-lead">
          {plan.sent
            ? t('delivery.next.sent')
            : storeCount === 0
              ? t('delivery.next.choose')
              : t('delivery.next.partner')}
        </p>
        {lock ? (
          <LockedButton
            className="mt-4 w-full rounded-full"
            reason={t(lock)}
            variant="outline"
          >
            {t('delivery.editPlan')}
          </LockedButton>
        ) : (
          <Button
            className="artist-workspace-primary mt-4 w-full rounded-full"
            onClick={() => setEditing(true)}
            variant="primary"
          >
            {t('delivery.editPlan')}
          </Button>
        )}
        <p className="artist-release-honest">
          {plan.sent ? (
            <Send aria-hidden="true" />
          ) : (
            <Info aria-hidden="true" />
          )}
          {plan.sent ? t('delivery.honest.sent') : t('delivery.honest.notSent')}
        </p>
      </section>
      {editing && (
        <DeliveryPlanDialog
          artistId={artistId}
          delivery={plan}
          expectedUpdatedAt={release.updatedAt}
          onClose={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      )}
    </div>
  )
}
