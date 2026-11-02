import {
  type ReleaseStage,
  type ReleaseWorkspace,
  releaseStageLabels,
  releaseStages,
  stageProgress,
  stageProgressLabels,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'

interface ReleaseStepperProps {
  release: ReleaseWorkspace
  /** The stage on screen; every stage can be opened, whatever its progress. */
  active: ReleaseStage
}

/** The five release stages as navigation, each showing where it stands. */
export function ReleaseStepper({ release, active }: ReleaseStepperProps) {
  const progress = stageProgress(release.status)
  const { t } = useI18n()
  return (
    <nav aria-label={t('workspace.stages')} className="artist-release-stepper">
      <ol>
        {releaseStages.map((stage, index) => {
          const state = progress[stage]
          return (
            <li data-state={state} key={stage}>
              <Link
                aria-current={stage === active ? 'page' : undefined}
                params={{ releaseId: release.id }}
                resetScroll={false}
                search={{ step: stage }}
                to="/dashboard/music/$releaseId"
              >
                <span aria-hidden="true" className="artist-release-step-dot">
                  {state === 'complete' ? <Check /> : index + 1}
                </span>
                <span className="artist-release-step-name">
                  {t(releaseStageLabels[stage])}
                </span>
                <span className="sr-only">{t(stageProgressLabels[state])}</span>
              </Link>
              {index < releaseStages.length - 1 && (
                <span aria-hidden="true" className="artist-release-step-line" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
