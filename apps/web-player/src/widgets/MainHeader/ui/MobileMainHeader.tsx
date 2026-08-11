'use client'

import { Plus, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { BurgerMenu } from '@/widgets/MainHeader/ui/BurgerMenu'
import { HeaderSearch } from '@/widgets/MainHeader/ui/HeaderSearch'
import { NotificationsPopover } from '@/widgets/MainHeader/ui/NotificationsPopover'

type MobileMainHeaderProps = {
  onCreate?: () => void
}

const getPageTitleKey = (pathname: string) => {
  if (pathname.startsWith(ROUTES.search())) return 'nav.search' as const
  if (pathname.startsWith(ROUTES.library)) return 'library.title' as const
  if (pathname.startsWith(ROUTES.profile)) return 'common.profile' as const
  if (pathname.startsWith(ROUTES.recents)) return 'recents.title' as const
  if (pathname.startsWith(ROUTES.settings)) return 'settings.title' as const
  return null
}

export const MobileMainHeader = ({ onCreate }: MobileMainHeaderProps) => {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const titleKey = getPageTitleKey(pathname)
  const isSearch = pathname.startsWith(ROUTES.search())
  const isLibrary = pathname.startsWith(ROUTES.library)

  const focusLibrarySearch = () => {
    document.getElementById('library-filter')?.focus()
  }

  return (
    <div className="flex h-full w-full items-center gap-3">
      <BurgerMenu trigger="avatar" />
      {isSearch ? (
        <HeaderSearch className="min-w-0 flex-1 w-full" />
      ) : titleKey ? (
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold text-text">
          {t(titleKey)}
        </h1>
      ) : (
        <div className="flex-1" />
      )}

      {isAuthenticated && <NotificationsPopover />}

      {isLibrary && (
        <div className="flex items-center">
          <button
            aria-label={t('library.search')}
            className="rounded-full p-2.5 text-text transition-colors hover:bg-surface"
            onClick={focusLibrarySearch}
            type="button"
          >
            <Search size={23} />
          </button>
          <button
            aria-label={t('library.createPlaylist')}
            className="rounded-full p-2.5 text-text transition-colors hover:bg-surface"
            onClick={onCreate}
            type="button"
          >
            <Plus size={25} />
          </button>
        </div>
      )}
    </div>
  )
}
