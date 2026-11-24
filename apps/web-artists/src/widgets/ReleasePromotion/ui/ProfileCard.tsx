import { Button } from '@bitrate/ui-react'
import { channelNames, type PromotionProfile } from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { IdCard } from 'lucide-react'

const GOAL_LABELS = {
  STREAMS: 'promotion.goal.streams',
  FOLLOWERS: 'promotion.goal.followers',
  BUZZ: 'promotion.goal.buzz',
} as const

interface ProfileCardProps {
  profile: PromotionProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { t } = useI18n()
  return (
    <section className="artist-release-workspace-panel">
      <h2>
        <PanelIcon icon={IdCard} />
        {t('promotion.profileCard.title')}
      </h2>
      <dl className="artist-promotion-kv">
        <div>
          <dt>{t('promotion.profileCard.goal')}</dt>
          <dd>{t(GOAL_LABELS[profile.goal])}</dd>
        </div>
        <div>
          <dt>{t('promotion.profileCard.channels')}</dt>
          <dd>{profile.channels.map((c) => channelNames[c]).join(' · ')}</dd>
        </div>
        <div>
          <dt>{t('promotion.profileCard.weekly')}</dt>
          <dd>
            {t('promotion.profileCard.weeklyValue', {
              hours: profile.weeklyHours,
            })}
          </dd>
        </div>
        {profile.voiceWords.length > 0 && (
          <div>
            <dt>{t('promotion.profileCard.voice')}</dt>
            <dd>{profile.voiceWords.join(' · ')}</dd>
          </div>
        )}
      </dl>
      <Button asChild className="mt-4 w-full" variant="ghost">
        <Link to={ROUTES.dashboard.promotionProfile}>
          {t('promotion.profileCard.edit')}
        </Link>
      </Button>
    </section>
  )
}
