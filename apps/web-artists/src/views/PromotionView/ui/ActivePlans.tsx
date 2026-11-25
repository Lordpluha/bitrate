import { Button } from '@bitrate/ui-react'
import type { CalendarEntry } from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, CalendarRange } from 'lucide-react'
import { activePlans } from '../model/groupCalendar'

interface ActivePlansProps {
  entries: readonly CalendarEntry[]
}

/** Each release with a plan in the window, linking to its Promotion stage. */
export function ActivePlans({ entries }: ActivePlansProps) {
  const { t, tp } = useI18n()
  const plans = activePlans(entries)
  if (plans.length === 0) return null
  return (
    <section
      aria-labelledby="promotion-active-plans"
      className="artist-release-workspace-panel"
    >
      <h2 id="promotion-active-plans">
        <PanelIcon icon={CalendarRange} />
        {t('promotion.page.activePlans')}
      </h2>
      <ul className="artist-release-rows">
        {plans.map((plan) => (
          <li key={plan.releaseId}>
            <CalendarRange aria-hidden="true" />
            <span className="min-w-0">
              <span className="artist-release-row-title">{plan.title}</span>
              <span>
                {tp({ count: plan.steps, key: 'promotion.page.stepsCount' })}
              </span>
            </span>
            <Button asChild size="sm" variant="ghost">
              <Link
                params={{ releaseId: plan.releaseId }}
                search={{ step: 'promotion' }}
                to="/dashboard/music/$releaseId"
              >
                <ArrowUpRight aria-hidden="true" />
                {t('promotion.page.open')}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
