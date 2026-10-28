'use client'

import { ChevronLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { BackButton } from '@/shared/ui/BackButton'
import { BurgerMenu } from '@/widgets/MainHeader/ui/BurgerMenu'
import { HeaderSearch } from '@/widgets/MainHeader/ui/HeaderSearch'
import { NotificationsPopover } from '@/widgets/MainHeader/ui/NotificationsPopover'

/**
 * Pages one step below a top-level page that have no back button of their own (album and
 * playlist heroes carry one), so the header shows the design's back chevron instead.
 */
const NESTED_PAGE_PREFIXES = [
  ROUTES.artist(''),
  ROUTES.user(''),
  ROUTES.podcast(''),
  ROUTES.findFriends,
  ROUTES.friendRequests,
]

/**
 * The header below `xl`: the account menu (or Back on a nested page), the search field on the
 * search page and the bell. Each page shows its own title and actions, so the header does not
 * repeat them.
 */
export const MobileMainHeader = () => {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const isSearch = pathname.startsWith(ROUTES.search())
  const isNested = NESTED_PAGE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  )

  return (
    <div className="flex h-full w-full items-center gap-3">
      {isNested ? (
        <BackButton
          aria-label={t('common.back')}
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface"
        >
          <ChevronLeft aria-hidden="true" size={24} />
        </BackButton>
      ) : (
        <BurgerMenu trigger="avatar" />
      )}
      {isSearch ? (
        <HeaderSearch className="min-w-0 flex-1 w-full" />
      ) : (
        <div className="flex-1" />
      )}
      {isAuthenticated && <NotificationsPopover />}
    </div>
  )
}
