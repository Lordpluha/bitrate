import { cn } from '@bitrate/ui-react'
import type { ReleaseWorkspace } from '@entities/release'

type Status = ReleaseWorkspace['status']

const STAGES = ['Draft', 'Review', 'Prepare', 'Deliver', 'Launch'] as const

/** Macro stages; the roadmap panel breaks Draft down into its preparation steps. */
function stageLabel(index: number, status: Status) {
  if (index === 0) return status === 'DRAFT' ? 'Current' : 'Done'
  if (index === 1) {
    if (status === 'SUBMITTED' || status === 'REJECTED') return 'Current'
    return status === 'READY' || status === 'RELEASED' ? 'Done' : 'Next'
  }
  if (status === 'RELEASED') return 'Done'
  return 'Coming soon'
}

export function WorkspaceStages({ status }: { status: Status }) {
  return (
    <section
      aria-labelledby="release-stages-heading"
      className="artist-release-workspace-panel artist-release-stages"
    >
      <h2 className="lg:sr-only" id="release-stages-heading">
        Release timeline
      </h2>
      <p className="lg:sr-only">
        Bitrate review is available; delivery is coming soon.
      </p>
      <ol>
        {STAGES.map((stage, index) => {
          const label = stageLabel(index, status)
          return (
            <li
              aria-current={label === 'Current' ? 'step' : undefined}
              key={stage}
            >
              <span
                className={cn(
                  'artist-release-stage-number',
                  label === 'Current' && 'artist-workspace-primary',
                )}
              >
                {index + 1}
              </span>
              <span>{stage}</span>
              <small>{label}</small>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
