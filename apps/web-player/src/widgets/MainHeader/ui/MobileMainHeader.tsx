'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/shared/hooks'
import { ROUTES } from '@/shared/routes'
import { BurgerMenu } from '@/widgets/MainHeader/ui/BurgerMenu'
import { HeaderSearch } from '@/widgets/MainHeader/ui/HeaderSearch'
import { NotificationsPopover } from '@/widgets/MainHeader/ui/NotificationsPopover'

/**
 * The header below `xl`: the account menu, the search field on the search page and the bell.
 * Each page shows its own title and actions, so the header does not repeat them.
 */
export const MobileMainHeader = () => {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const isSearch = pathname.startsWith(ROUTES.search())

  return (
    <div className="flex h-full w-full items-center gap-3">
      <BurgerMenu trigger="avatar" />
      {isSearch ? (
        <HeaderSearch className="min-w-0 flex-1 w-full" />
      ) : (
        <div className="flex-1" />
      )}
      {isAuthenticated && <NotificationsPopover />}
    </div>
  )
}
