'use client'

import { Plus, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/shared/routes'
import { BurgerMenu } from '@/widgets/MainHeader/ui/BurgerMenu'
import { HeaderSearch } from '@/widgets/MainHeader/ui/HeaderSearch'

type MobileMainHeaderProps = {
  onCreate?: () => void
}

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith(ROUTES.search())) return 'Search'
  if (pathname.startsWith(ROUTES.library)) return 'Your Library'
  if (pathname.startsWith(ROUTES.profile)) return 'Profile'
  if (pathname.startsWith(ROUTES.recents)) return 'Recents'
  if (pathname.startsWith(ROUTES.settings)) return 'Settings'
  return null
}

export const MobileMainHeader = ({ onCreate }: MobileMainHeaderProps) => {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
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
      ) : title ? (
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold text-text">
          {title}
        </h1>
      ) : (
        <div className="flex-1" />
      )}

      {isLibrary && (
        <div className="flex items-center">
          <button
            aria-label="Search in Your Library"
            className="rounded-full p-2.5 text-text transition-colors hover:bg-surface"
            onClick={focusLibrarySearch}
            type="button"
          >
            <Search size={23} />
          </button>
          <button
            aria-label="Create playlist"
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
