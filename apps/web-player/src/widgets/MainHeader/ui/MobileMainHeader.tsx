'use client'

import { ChevronLeft } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { type ReactNode, Suspense } from 'react'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { BackButton } from '@/shared/ui/BackButton'
import { BurgerMenu } from '@/widgets/MainHeader/ui/BurgerMenu'
import { HeaderSearch } from '@/widgets/MainHeader/ui/HeaderSearch'
import { NotificationsPopover } from '@/widgets/MainHeader/ui/NotificationsPopover'

/**
 * Pages one step below a top-level page, so the header shows the design's back chevron in
 * place of the account menu. Collection heroes (Liked Songs, playlists, albums) carry no Back
 * of their own below the desktop top bar, so they are listed here too.
 */
const NESTED_PAGE_PREFIXES = [
  ROUTES.artist(''),
  ROUTES.user(''),
  ROUTES.findFriends,
  ROUTES.friendRequests,
  ROUTES.likedSongs,
  ROUTES.playlist(''),
  ROUTES.album(''),
]

/** The query that turns the search page into a genre/category page. */
const CATEGORY_PARAM = 'category'

const HeaderBack = () => {
  const { t } = useI18n()

  return (
    <BackButton
      aria-label={t('common.back')}
      className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface"
    >
      <ChevronLeft aria-hidden="true" size={24} />
    </BackButton>
  )
}

type SearchLeadingProps = {
  menu: ReactNode
}

/** Back on a category page, the menu on plain search; reads the query, so it sits in Suspense. */
const SearchLeading = ({ menu }: SearchLeadingProps) => {
  const searchParams = useSearchParams()

  return searchParams.has(CATEGORY_PARAM) ? <HeaderBack /> : menu
}

/**
 * The header below `xl`: the account menu (or Back on a nested page), the search field on the
 * search page and the bell. Each page shows its own title and actions, so the header does not
 * repeat them.
 */
export const MobileMainHeader = () => {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const isSearch = pathname.startsWith(ROUTES.search())
  const isNested = NESTED_PAGE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  )
  const menu = <BurgerMenu trigger="avatar" />

  return (
    <div className="flex h-full w-full items-center gap-3">
      {isNested ? (
        <HeaderBack />
      ) : isSearch ? (
        <Suspense fallback={menu}>
          <SearchLeading menu={menu} />
        </Suspense>
      ) : (
        menu
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
