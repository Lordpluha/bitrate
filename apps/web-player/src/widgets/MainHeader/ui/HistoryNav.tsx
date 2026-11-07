'use client'

import { cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const NAV_BUTTON_CLASS =
  'flex size-8 items-center justify-center rounded-full bg-background/70 text-foreground transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'

type HistoryNavProps = {
  className?: string
}

/**
 * The desktop top bar's Back and Forward through the browser history, left of the search.
 * Pages carry no Back of their own; below `xl` the mobile header shows it instead.
 */
export const HistoryNav = ({ className }: HistoryNavProps) => {
  const { t } = useI18n()
  const router = useRouter()

  return (
    <nav
      aria-label={t('common.history')}
      className={cn('flex items-center gap-2', className)}
    >
      <button
        aria-label={t('common.back')}
        className={NAV_BUTTON_CLASS}
        onClick={() => router.back()}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={20} />
      </button>
      <button
        aria-label={t('common.forward')}
        className={NAV_BUTTON_CLASS}
        onClick={() => router.forward()}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={20} />
      </button>
    </nav>
  )
}
