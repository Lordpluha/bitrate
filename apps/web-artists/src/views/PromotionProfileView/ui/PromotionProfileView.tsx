import { Button } from '@bitrate/ui-react'
import { useAiAllowance, usePromotionProfile } from '@entities/promotion'
import { PromotionProfileForm } from '@features/promotion-profile'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PageSkeleton } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { PromotionEmpty } from '@widgets/ReleasePromotion'
import { ArrowLeft, Lock } from 'lucide-react'

interface PromotionProfileViewProps {
  artistId: string
}

/** The promotion profile page: goal, channels, audience and voice for every plan. */
export function PromotionProfileView({ artistId }: PromotionProfileViewProps) {
  const { t, tMessage } = useI18n()
  const allowance = useAiAllowance(artistId)
  const enabled = allowance.data?.enabled === true
  const profile = usePromotionProfile(artistId, enabled)
  const error = allowance.error ?? profile.error
  return (
    <section className="artist-music space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link to={ROUTES.dashboard.promotion}>
          <ArrowLeft aria-hidden="true" />
          {t('promotion.page.title')}
        </Link>
      </Button>
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
          {t('promotion.profile.title')}
        </h1>
        <p className="mt-2 text-[0.9375rem] text-text-secondary">
          {t('promotion.profile.subtitle')}
        </p>
      </div>
      {error ? (
        <div className="space-y-3">
          <p role="alert">{tMessage(error.message)}</p>
          <Button
            onClick={() => {
              void allowance.refetch()
              void profile.refetch()
            }}
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : allowance.isPending || (enabled && profile.isPending) ? (
        <PageSkeleton label={t('promotion.page.loading')} />
      ) : !enabled ? (
        <PromotionEmpty
          description={t('promotion.disabled.description')}
          icon={Lock}
          title={t('promotion.disabled.title')}
        />
      ) : (
        <PromotionProfileForm
          artistId={artistId}
          profile={profile.data ?? null}
        />
      )}
    </section>
  )
}
