import {
  availabilityLabels,
  type DestinationAvailability,
  type ReleaseDelivery,
  territorySummary,
} from '@entities/delivery'
import { releaseCoverUrl, releaseStatusLabels } from '@entities/release'
import {
  deliveryDestinations,
  destinationLabels,
} from '@shared/constants/destinations'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import {
  Ban,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleOff,
  Clock,
  type LucideIcon,
  Minus,
  Music2,
  Send,
  TriangleAlert,
} from 'lucide-react'

const availabilityIcons: Record<DestinationAvailability, LucideIcon> = {
  NOT_CONNECTED: CircleDashed,
  NOT_SENT: CircleDashed,
  UNAVAILABLE: CircleOff,
  PENDING: Clock,
  LIVE: CircleCheck,
  FAILED: TriangleAlert,
  TAKEN_DOWN: Ban,
}

const legendOrder: readonly DestinationAvailability[] = [
  'LIVE',
  'PENDING',
  'FAILED',
  'NOT_SENT',
  'NOT_CONNECTED',
  'UNAVAILABLE',
  'TAKEN_DOWN',
]

function ReleaseRow({ delivery }: { delivery: ReleaseDelivery }) {
  const i18n = useI18n()
  const { t } = i18n
  const anyPlanned = delivery.destinations.some((item) => item.planned)
  return (
    <li className="artist-dist-row">
      <div className="artist-dist-release">
        {delivery.cover ? (
          <img alt="" src={releaseCoverUrl(delivery.cover)} />
        ) : (
          <span className="artist-release-cover-placeholder">
            <Music2 aria-hidden="true" />
          </span>
        )}
        <div className="artist-dist-release-meta">
          <h3>
            <Link
              className="artist-dist-title"
              params={{ releaseId: delivery.releaseId }}
              to="/dashboard/music/$releaseId"
            >
              {delivery.title}
            </Link>
          </h3>
          <p>
            <span
              className="artist-dash-releases-status"
              data-status={delivery.status}
            >
              {t(releaseStatusLabels[delivery.status])}
            </span>
            {' · '}
            {territorySummary(delivery, i18n)}
            {' · '}
            {delivery.sent
              ? t('delivery.page.sent')
              : anyPlanned
                ? t('delivery.availability.notSent')
                : t('delivery.noStores')}
          </p>
        </div>
      </div>
      <ul className="artist-dist-stores">
        {deliveryDestinations.map((destination) => {
          const state = delivery.destinations.find(
            (item) => item.destination === destination,
          )
          const planned = state?.planned ?? false
          const Icon =
            planned && state ? availabilityIcons[state.availability] : Minus
          const label =
            planned && state
              ? t(availabilityLabels[state.availability])
              : t('delivery.notInPlan')
          const store = destinationLabels[destination]
          return (
            <li
              data-availability={planned ? state?.availability : 'NONE'}
              key={destination}
              title={[`${store}: ${label}`, state?.message]
                .filter(Boolean)
                .join('. ')}
            >
              <Icon aria-hidden="true" />
              <span className="artist-dist-store-name">{store}</span>
              <span className="sr-only">{label}</span>
            </li>
          )
        })}
      </ul>
      <ChevronRight aria-hidden="true" className="artist-dist-chevron" />
    </li>
  )
}

/** Every release against every store; a store only reads as sent once it reports so. */
export function DeliveryMatrix({ releases }: { releases: ReleaseDelivery[] }) {
  const { t } = useI18n()
  const shown = new Set(
    releases.flatMap((delivery) =>
      delivery.destinations
        .filter((item) => item.planned)
        .map((item) => item.availability),
    ),
  )
  return (
    <section
      aria-labelledby="distribution-plan-heading"
      className="artist-release-workspace-panel artist-dist-matrix"
    >
      <h2 id="distribution-plan-heading">
        <PanelIcon icon={Send} />
        {t('delivery.title')}
      </h2>
      <div aria-hidden="true" className="artist-dist-head">
        <span />
        <div>
          {deliveryDestinations.map((destination) => (
            <span key={destination}>{destinationLabels[destination]}</span>
          ))}
        </div>
        <span />
      </div>
      <ul className="artist-dist-rows">
        {releases.map((delivery) => (
          <ReleaseRow delivery={delivery} key={delivery.releaseId} />
        ))}
      </ul>
      <ul aria-hidden="true" className="artist-dist-legend">
        {legendOrder.flatMap((availability) => {
          if (!shown.has(availability)) return []
          const Icon = availabilityIcons[availability]
          return (
            <li data-availability={availability} key={availability}>
              <Icon />
              {t(availabilityLabels[availability])}
            </li>
          )
        })}
        <li data-availability="NONE">
          <Minus />
          {t('delivery.notInPlan')}
        </li>
      </ul>
    </section>
  )
}
