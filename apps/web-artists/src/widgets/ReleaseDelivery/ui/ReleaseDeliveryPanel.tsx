import { Button } from '@bitrate/ui-react'
import {
  plannedSummary,
  territorySummary,
  useReleaseDelivery,
} from '@entities/delivery'
import { DeliveryPlanDialog } from '@features/delivery-plan'
import { Info, Send } from 'lucide-react'
import { useState } from 'react'
import { DestinationStates } from './DestinationStates'

interface ReleaseDeliveryPanelProps {
  artistId: string
  releaseId: string
  /** The release version the plan is edited against; only drafts can change the plan. */
  release: { status: string; updatedAt: string }
}

/** Delivery plan and per-store state; states plainly when nothing has been sent. */
export function ReleaseDeliveryPanel({
  artistId,
  releaseId,
  release,
}: ReleaseDeliveryPanelProps) {
  const delivery = useReleaseDelivery(artistId, releaseId)
  const [editing, setEditing] = useState(false)
  const draft = release.status === 'DRAFT'

  return (
    <section
      aria-labelledby="release-delivery-heading"
      className="artist-release-workspace-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="release-delivery-heading">Delivery plan</h2>
        {draft && delivery.data && (
          <Button onClick={() => setEditing(true)} size="sm" variant="outline">
            Edit plan
          </Button>
        )}
      </div>
      {delivery.isPending ? (
        <p role="status">Loading delivery plan…</p>
      ) : delivery.isError ? (
        <div className="space-y-2">
          <p role="alert">{delivery.error.message}</p>
          <Button
            onClick={() => {
              void delivery.refetch()
            }}
            size="sm"
            variant="outline"
          >
            Try again
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <div className="artist-release-inset">
            {delivery.data.sent ? (
              <Send
                aria-hidden="true"
                className="size-5 shrink-0 text-accent"
              />
            ) : (
              <Info
                aria-hidden="true"
                className="size-5 shrink-0 text-accent"
              />
            )}
            <p>
              {delivery.data.sent
                ? 'Store states below are reported by the distribution partner.'
                : delivery.data.partner.connected
                  ? 'Nothing has been sent yet.'
                  : 'Nothing has been sent. Store delivery starts once a distribution partner is connected.'}
            </p>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-secondary">Stores</dt>
              <dd>{plannedSummary(delivery.data)}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Territories</dt>
              <dd>{territorySummary(delivery.data)}</dd>
            </div>
          </dl>
          <DestinationStates delivery={delivery.data} />
        </div>
      )}
      {editing && delivery.data && (
        <DeliveryPlanDialog
          artistId={artistId}
          delivery={delivery.data}
          expectedUpdatedAt={release.updatedAt}
          onClose={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      )}
    </section>
  )
}
