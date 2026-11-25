import { Button } from '@bitrate/ui-react'
import {
  useAiAllowance,
  usePromotionPlan,
  usePromotionProfile,
  useRequestPlan,
} from '@entities/promotion'
import type { ReleaseWorkspace } from '@entities/release'
import { StepPostsPanel } from '@features/promotion-posts'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PageSkeleton } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import {
  CalendarDays,
  Loader,
  Lock,
  Megaphone,
  TriangleAlert,
} from 'lucide-react'
import { PlanBoard } from './PlanBoard'
import { PromotionEmpty } from './PromotionEmpty'
import { PromotionReady } from './PromotionReady'

interface PromotionStageProps {
  artistId: string
  release: ReleaseWorkspace
  /** The POST step whose drafts are open, from the URL. */
  postStepId?: string
  onOpenPosts: (stepId: string | undefined) => void
}

/** The release's Promotion stage: every state from "no profile" to the plan and its post drafts. */
export function PromotionStage({
  artistId,
  release,
  postStepId,
  onOpenPosts,
}: PromotionStageProps) {
  const { t, tMessage } = useI18n()
  const allowance = useAiAllowance(artistId)
  const enabled = allowance.data?.enabled === true
  const profile = usePromotionProfile(artistId, enabled)
  const plan = usePromotionPlan(artistId, release.id, enabled)
  const retry = useRequestPlan(artistId, release.id)
  const queries = [allowance, ...(enabled ? [profile, plan] : [])]
  const failed = queries.find((query) => query.isError)
  if (failed?.error)
    return (
      <PromotionEmpty
        action={
          <Button
            onClick={() => queries.forEach((query) => void query.refetch())}
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        }
        description={tMessage(failed.error.message)}
        icon={TriangleAlert}
        title={t('promotion.failed.title')}
        tone="error"
      />
    )
  if (queries.some((query) => query.isPending) || !allowance.data)
    return <PageSkeleton label={t('promotion.page.loading')} />
  if (!enabled)
    return (
      <PromotionEmpty
        description={t('promotion.disabled.description')}
        icon={Lock}
        title={t('promotion.disabled.title')}
      />
    )
  if (!release.scheduledAt)
    return (
      <PromotionEmpty
        action={
          <Button asChild>
            <Link
              params={{ releaseId: release.id }}
              search={{ step: 'draft' }}
              to="/dashboard/music/$releaseId"
            >
              {t('promotion.noDate.action')}
            </Link>
          </Button>
        }
        description={t('promotion.noDate.description')}
        icon={CalendarDays}
        title={t('promotion.noDate.title')}
      />
    )
  if (!profile.data)
    return (
      <PromotionEmpty
        action={
          <Button asChild>
            <Link to={ROUTES.dashboard.promotionProfile}>
              {t('promotion.noProfile.action')}
            </Link>
          </Button>
        }
        description={t('promotion.noProfile.description')}
        icon={Megaphone}
        title={t('promotion.noProfile.title')}
      />
    )
  if (!plan.data)
    return (
      <PromotionReady
        allowance={allowance.data}
        artistId={artistId}
        releaseId={release.id}
        releaseTitle={release.title}
      />
    )
  if (plan.data.status === 'GENERATING')
    return (
      <PromotionEmpty
        description={t('promotion.generating.description')}
        icon={Loader}
        title={t('promotion.generating.title')}
      />
    )
  if (plan.data.status === 'FAILED')
    return (
      <PromotionEmpty
        action={
          <Button disabled={retry.isPending} onClick={() => retry.mutate()}>
            {t('promotion.failed.action')}
          </Button>
        }
        description={tMessage(
          retry.error?.message ??
            plan.data.failure ??
            'promotion.failed.description',
        )}
        icon={TriangleAlert}
        title={t('promotion.failed.title')}
        tone="error"
      />
    )
  const postStep = plan.data.steps.find(
    (step) => step.id === postStepId && step.kind === 'POST',
  )
  if (postStep)
    return (
      <StepPostsPanel
        artistId={artistId}
        canGenerate={allowance.data.usedMicroUsd < allowance.data.limitMicroUsd}
        onBack={() => onOpenPosts(undefined)}
        releaseId={release.id}
        step={postStep}
      />
    )
  return (
    <PlanBoard
      allowance={allowance.data}
      artistId={artistId}
      onOpenPosts={onOpenPosts}
      plan={plan.data}
      profile={profile.data}
      releaseId={release.id}
    />
  )
}
