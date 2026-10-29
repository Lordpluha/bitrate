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
import { useI18n } from '@shared/i18n'
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

const planned = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

/** Why the plan cannot change in `status`; drafts and approved releases can always plan. */
function planLockReason(status: Status): string | null {
  if (status === 'DRAFT' || status === 'READY') return null
  if (wentLive(status))
    return 'The release is live; its delivery plan can no longer change.'
  if (publishing(status))
    return 'The delivery plan is locked while the release is being published.'
  return status === 'REJECTED'
    ? 'Start revising on the Review step to change the delivery plan.'
    : 'The delivery plan is locked while Bitrate reviews this release.'
}

/** The timing stays editable in the draft and after approval, until publishing starts. */
function scheduleLockReason(status: Status): string | null {
  if (status === 'DRAFT' || status === 'READY') return null
  if (wentLive(status))
    return 'The release is live; its timing can no longer change.'
  if (publishing(status))
    return 'The release timing is locked while the release is being published.'
  return status === 'REJECTED'
    ? 'Start revising on the Review step to change the release timing.'
    : 'The release timing is locked while Bitrate reviews this release.'
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
  const { tMessage } = useI18n()
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
        <h2 id="release-delivery-heading">Delivery plan</h2>
        <p role="status">Loading delivery plan…</p>
      </section>
    )
  if (delivery.isError)
    return (
      <section
        aria-labelledby="release-delivery-heading"
        className="artist-release-workspace-panel space-y-2"
      >
        <h2 id="release-delivery-heading">Delivery plan</h2>
        <p role="alert">{tMessage(delivery.error.message)}</p>
        <Button
          onClick={() => {
            void delivery.refetch()
          }}
          size="sm"
          variant="outline"
        >
          Try again
        </Button>
      </section>
    )

  const plan = delivery.data
  const storeCount = plan.destinations.filter((item) => item.planned).length
  const checks = [
    { done: approved, label: 'Bitrate review approved' },
    {
      done: true,
      label: release.scheduledAt
        ? `Premiere ${planned.format(new Date(release.scheduledAt))} UTC`
        : 'Goes live right away when published',
    },
    {
      done: storeCount > 0,
      label: storeCount > 0 ? plannedSummary(plan) : 'No stores planned yet',
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
            <h2 id="release-timing-heading">Release timing</h2>
            {scheduleLock ? (
              <LockedButton reason={scheduleLock} size="sm" variant="outline">
                Edit schedule
              </LockedButton>
            ) : (
              <Button onClick={onSchedule} size="sm" variant="outline">
                Edit schedule
              </Button>
            )}
          </div>
          <p>
            When and where the release goes out. It stays a plan until a
            distribution partner delivers it.
          </p>
          <dl className="artist-release-fact-grid">
            <div data-done={true}>
              <dt>
                <span aria-hidden="true" className="artist-release-fact-icon">
                  <CalendarDays />
                </span>
                Release date
              </dt>
              <dd>
                {release.scheduledAt
                  ? `${planned.format(new Date(release.scheduledAt))} UTC`
                  : 'Right away'}
              </dd>
              <dd className="artist-release-fact-hint">
                {release.scheduledAt
                  ? 'A premiere: it goes live at this date and time.'
                  : 'It goes live as soon as you publish it.'}
              </dd>
            </div>
            <div data-done={true}>
              <dt>
                <span aria-hidden="true" className="artist-release-fact-icon">
                  <Globe2 />
                </span>
                Territories
              </dt>
              <dd>{territorySummary(plan)}</dd>
              <dd className="artist-release-fact-hint">
                Countries where listeners can find it. Change them in the
                delivery plan.
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
            <h2 id="release-delivery-heading">Destinations</h2>
            <span className="text-xs text-text-secondary">
              {storeCount} of {plan.destinations.length} planned
            </span>
          </div>
          <dl className="sr-only">
            <dt>Stores</dt>
            <dd>{plannedSummary(plan)}</dd>
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
                        (item.planned ? 'In the plan' : 'Not in the plan')}
                    </span>
                  </span>
                  <span
                    className="artist-release-chip"
                    data-tone={tone[item.availability]}
                  >
                    {availabilityLabels[item.availability]}
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
        <h2 id="release-delivery-next-heading">Before you continue</h2>
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
        <p className="artist-release-eyebrow mt-5">Next action</p>
        <p className="artist-release-side-lead">
          {plan.sent
            ? 'Store states below are reported by the distribution partner.'
            : storeCount === 0
              ? 'Choose the stores and territories for this release.'
              : 'Delivery starts once a distribution partner is connected.'}
        </p>
        {lock ? (
          <LockedButton
            className="mt-4 w-full rounded-full"
            reason={lock}
            variant="outline"
          >
            Edit delivery plan
          </LockedButton>
        ) : (
          <Button
            className="artist-workspace-primary mt-4 w-full rounded-full"
            onClick={() => setEditing(true)}
            variant="primary"
          >
            Edit delivery plan
          </Button>
        )}
        <p className="artist-release-honest">
          {plan.sent ? (
            <Send aria-hidden="true" />
          ) : (
            <Info aria-hidden="true" />
          )}
          {plan.sent
            ? 'Delivery has started through the connected partner.'
            : 'Nothing has been sent. Saving this plan does not send the release to any external platform.'}
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
