'use client'

import { ROUTES } from '@shared/routes'
import { cn } from '@spotify/ui-react'
import { House, Library, Plus, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { useI18n } from '@/shared/i18n'
import { MobileCreatePlaylistSheet } from '@/widgets/LeftSidebar'

type MobileBottomNavigationProps = {
  isCreateOpen: boolean
  onCreateOpenChange: (isOpen: boolean) => void
}

const navigationItemClassName =
  'flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors'

export const MobileBottomNavigation = ({
  isCreateOpen,
  onCreateOpenChange,
}: MobileBottomNavigationProps) => {
  const { t } = useI18n()
  const pathname = usePathname()
  const isHomeActive = pathname === ROUTES.main && !isCreateOpen
  const isSearchActive = pathname.startsWith(ROUTES.search()) && !isCreateOpen
  const isLibraryActive =
    (pathname.startsWith(ROUTES.library) ||
      pathname.startsWith(ROUTES.likedSongs)) &&
    !isCreateOpen

  const closeCreateSheet = () => onCreateOpenChange(false)

  return (
    <>
      <MobileCreatePlaylistSheet
        isOpen={isCreateOpen}
        onOpenChange={onCreateOpenChange}
      />

      <nav
        aria-label={t('nav.main')}
        className={cn(
          Z_INDEX_CLASS.bottomNavigation,
          'fixed inset-x-0 bottom-0 h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-white/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md',
        )}
      >
        <div className="grid h-full grid-cols-4 px-1">
          <Link
            aria-current={isHomeActive ? 'page' : undefined}
            className={cn(
              navigationItemClassName,
              isHomeActive ? 'text-text' : 'text-text-subdued',
            )}
            href={ROUTES.main}
            onClick={closeCreateSheet}
          >
            <House size={22} strokeWidth={isHomeActive ? 3 : 2} />
            <span className="truncate">{t('nav.home')}</span>
          </Link>

          <Link
            aria-current={isSearchActive ? 'page' : undefined}
            className={cn(
              navigationItemClassName,
              isSearchActive ? 'text-text' : 'text-text-subdued',
            )}
            href={ROUTES.search()}
            onClick={closeCreateSheet}
          >
            <Search size={23} strokeWidth={isSearchActive ? 3 : 2} />
            <span className="truncate">{t('nav.search')}</span>
          </Link>

          <Link
            aria-current={isLibraryActive ? 'page' : undefined}
            className={cn(
              navigationItemClassName,
              isLibraryActive ? 'text-text' : 'text-text-subdued',
            )}
            href={ROUTES.library}
            onClick={closeCreateSheet}
          >
            <Library
              fill={isLibraryActive ? 'currentColor' : 'none'}
              size={22}
              strokeWidth={isLibraryActive ? 2.5 : 2}
            />
            <span className="truncate">{t('nav.library')}</span>
          </Link>

          <button
            aria-expanded={isCreateOpen}
            className={cn(
              navigationItemClassName,
              isCreateOpen ? 'text-text' : 'text-text-subdued',
            )}
            onClick={() => onCreateOpenChange(!isCreateOpen)}
            type="button"
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full transition-colors',
                isCreateOpen && 'bg-text text-background',
              )}
            >
              {isCreateOpen ? <X size={22} /> : <Plus size={24} />}
            </span>
            <span className="truncate">{t('nav.create')}</span>
          </button>
        </div>
      </nav>
    </>
  )
}
