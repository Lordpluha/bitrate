import { Button } from '@bitrate/ui-react'
import { useAiAllowance, usePromotionCalendar } from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PageSkeleton } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { PromotionEmpty, PromotionPromise } from '@widgets/ReleasePromotion'
import {
  CalendarClock,
  CalendarDays,
  History,
  IdCard,
  Lock,
  Megaphone,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { groupCalendar } from '../model/groupCalendar'
import { ActivePlans } from './ActivePlans'
import { CalendarSection } from './CalendarSection'
import { PromotionGlance } from './PromotionGlance'

interface PromotionViewProps {
  artistId: string
}

/** The Promotion page: upcoming plan steps across every release (spec D-9). Nothing is posted for the artist. */
export function PromotionView({ artistId }: PromotionViewProps) {
  const { t, tMessage } = useI18n()
  const allowance = useAiAllowance(artistId)
  const enabled = allowance.data?.enabled === true
  const calendar = usePromotionCalendar(artistId, enabled)
  const error = allowance.error ?? calendar.error
  const head = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
          {t('promotion.page.title')}
        </h1>
        <p className="mt-2 text-[0.9375rem] text-text-secondary">
          {t('promotion.page.subtitle')}
        </p>
      </div>
      {enabled && (
        <Button asChild variant="outline">
          <Link to={ROUTES.dashboard.promotionProfile}>
            <IdCard aria-hidden="true" />
            {t('promotion.page.profileAction')}
          </Link>
        </Button>
      )}
    </div>
  )
  let body: ReactNode
  if (error)
    body = (
      <div className="space-y-3">
        <p role="alert">{tMessage(error.message)}</p>
        <Button
          onClick={() => {
            void allowance.refetch()
            void calendar.refetch()
          }}
          variant="outline"
        >
          {t('common.tryAgain')}
        </Button>
      </div>
    )
  else if (
    allowance.isPending ||
    (enabled && calendar.isPending) ||
    !allowance.data
  )
    body = <PageSkeleton label={t('promotion.page.loading')} />
  else if (!enabled)
    body = (
      <PromotionEmpty
        description={t('promotion.disabled.description')}
        icon={Lock}
        title={t('promotion.disabled.title')}
      />
    )
  else if (!calendar.data?.length)
    body = (
      <PromotionEmpty
        action={
          <Button asChild>
            <Link
              search={{ tab: 'releases', page: 1 }}
              to={ROUTES.dashboard.music}
            >
              {t('promotion.page.emptyAction')}
            </Link>
          </Button>
        }
        description={t('promotion.page.emptyDescription')}
        icon={Megaphone}
        title={t('promotion.page.emptyTitle')}
      />
    )
  else {
    const groups = groupCalendar(calendar.data, new Date())
    body = (
      <>
        <PromotionGlance
          allowance={allowance.data}
          dueThisWeek={groups.thisWeek.length}
          entries={calendar.data}
        />
        <div className="artist-release-stage">
          <div className="artist-release-stage-main grid gap-4">
            <CalendarSection
              entries={groups.thisWeek}
              icon={CalendarDays}
              title={t('promotion.page.thisWeek')}
            />
            <CalendarSection
              entries={groups.later}
              icon={CalendarClock}
              title={t('promotion.page.later')}
            />
            <CalendarSection
              entries={groups.earlier}
              icon={History}
              title={t('promotion.page.earlier')}
            />
          </div>
          <div className="artist-release-stage-side artist-promotion-side">
            <ActivePlans entries={calendar.data} />
            <PromotionPromise />
          </div>
        </div>
      </>
    )
  }
  return (
    <section className="artist-music space-y-6">
      {head}
      {body}
    </section>
  )
}
