'use client'

import { cn } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import { Clock3, Heart, House, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/shared/i18n'

type LibraryNavProps = {
  isCollapsed: boolean
}

/**
 * The library panel's main navigation (the design's Nav Items): 37px rows, the current page
 * outlined in the primary colour. The collapsed panel keeps only the icons.
 */
export const LibraryNav = ({ isCollapsed }: LibraryNavProps) => {
  const { t } = useI18n()
  const pathname = usePathname()
  const items = [
    { href: ROUTES.main, icon: House, label: t('nav.home') },
    { href: ROUTES.search(), icon: Search, label: t('nav.search') },
    { href: ROUTES.charts, icon: TrendingUp, label: t('nav.charts') },
    { href: ROUTES.likedSongs, icon: Heart, label: t('library.likedSongs') },
    { href: ROUTES.recents, icon: Clock3, label: t('library.recents') },
  ]

  return (
    <nav aria-label={t('nav.main')} className="flex w-full flex-col gap-1">
      {items.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href.split('?')[0]

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            aria-label={isCollapsed ? label : undefined}
            className={cn(
              'flex h-9.25 items-center gap-3 rounded-[7px] border px-3 text-sm transition-colors',
              isCollapsed && 'justify-center px-0',
              isActive
                ? 'border-primary bg-secondary font-semibold text-foreground'
                : 'border-transparent text-muted-foreground hover:bg-surface hover:text-foreground',
            )}
            href={href}
            key={href}
            title={isCollapsed ? label : undefined}
          >
            <Icon
              aria-hidden="true"
              className={cn('size-4.5 shrink-0', isActive && 'text-accent')}
            />
            {isCollapsed ? null : <span className="truncate">{label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
