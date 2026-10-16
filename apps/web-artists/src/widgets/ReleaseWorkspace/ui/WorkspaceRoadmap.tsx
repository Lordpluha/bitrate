import { cn } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  type RoadmapState,
  releaseRoadmap,
  roadmapProgress,
} from '@entities/release'
import { Check, Circle, CircleDot, Clock } from 'lucide-react'

const stateLabels = {
  done: 'Done',
  current: 'Next up',
  todo: 'To do',
  later: 'Later',
} satisfies Record<RoadmapState, string>

const stateIcons = {
  done: Check,
  current: CircleDot,
  todo: Circle,
  later: Clock,
} satisfies Record<RoadmapState, unknown>

interface WorkspaceRoadmapProps {
  release: ReleaseWorkspace
}

/** The release's path from draft to stores, recomputed from saved data on every change. */
export function WorkspaceRoadmap({ release }: WorkspaceRoadmapProps) {
  const steps = releaseRoadmap(release)
  const { done, total } = roadmapProgress(steps)
  return (
    <section
      aria-labelledby="release-roadmap-heading"
      className="artist-release-workspace-panel"
    >
      <h2 id="release-roadmap-heading">Release roadmap</h2>
      <p>
        {done} of {total} steps done
      </p>
      <progress
        aria-label="Roadmap progress"
        className="mt-3 h-2 w-full overflow-hidden rounded-full accent-accent"
        max={total}
        value={done}
      />
      <ol className="mt-4 space-y-3">
        {steps.map((step) => {
          const Icon = stateIcons[step.state]
          return (
            <li
              aria-current={step.state === 'current' ? 'step' : undefined}
              className="flex items-start gap-3"
              key={step.key}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  'mt-0.5 size-5 shrink-0',
                  step.state === 'done' && 'text-accent',
                  step.state === 'current' && 'text-primary',
                  (step.state === 'todo' || step.state === 'later') &&
                    'text-text-secondary',
                )}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm',
                    step.state === 'current' && 'font-semibold',
                  )}
                >
                  {step.anchor && step.state !== 'done' ? (
                    <a className="underline" href={`#${step.anchor}`}>
                      {step.label}
                    </a>
                  ) : (
                    step.label
                  )}
                </p>
                <p className="text-xs text-text-secondary">{step.detail}</p>
              </div>
              <small className="shrink-0 text-xs text-text-secondary">
                {stateLabels[step.state]}
              </small>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
