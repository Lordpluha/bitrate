'use client'

import { useAppSelector, useMediaQuery } from '@shared/hooks'
import { cn } from '@spotify/ui-react'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainHeader } from '@widgets/MainHeader'
import { Player } from '@widgets/Player'
import { RightSidebar } from '@widgets/RightSidebar'
import { ChevronLeft, House, Library, Plus, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { useMainShellResize } from './useMainShellResize'

export default function MainLayout({ children }: PropsWithChildren) {
  const { currentTrack } = useAppSelector((state) => state.musicPlayer)
  const hasPlayer = !!currentTrack
  const isDesktop = useMediaQuery('(min-width: 1280px)')
  const isMobile = useMediaQuery('(max-width: 1024px)')
  const pathname = usePathname()
  const router = useRouter()
  const hasRightSidebar = hasPlayer && isDesktop
  const {
    gridTemplateColumns,
    handleCollapseRightSidebar,
    handleExpandRightSidebar,
    handleStartLeftResize,
    handleStartRightResize,
    handleToggleLibraryCollapsed,
    handleToggleLibraryExpanded,
    isLibraryCollapsed,
    isLibraryExpanded,
    isRightSidebarCollapsed,
    leftResizeLimits,
    rightResizeLimits,
    shellRef,
  } = useMainShellResize({ hasRightSidebar })

  if (isMobile) {
    return (
      <div className="h-dvh bg-background text-text overflow-hidden">
        <MainHeader />

        <div
          className={cn(
            'h-[calc(100dvh-64px)] overflow-y-auto custom-scrollbar',
            hasPlayer ? 'pb-40' : 'pb-20',
          )}
        >
          {children}
        </div>

        <nav className="fixed left-0 right-0 bottom-0 z-45 h-16 border-t border-white/10 bg-black/90 backdrop-blur-md">
          <div className="h-full grid grid-cols-4 px-2">
            <button
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                pathname === '/main'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/90',
              )}
              onClick={() => router.push('/main')}
              type="button"
            >
              <House size={18} />
              <span>Главная</span>
            </button>

            <button
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                pathname.startsWith('/main/search')
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/90',
              )}
              onClick={() => router.push('/main/search')}
              type="button"
            >
              <Search size={18} />
              <span>Поиск</span>
            </button>

            <button
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                pathname.startsWith('/main/library')
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/90',
              )}
              onClick={() => router.push('/main/library')}
              type="button"
            >
              <Library size={18} />
              <span>Your Library</span>
            </button>

            <button
              className="flex flex-col items-center justify-center gap-1 text-xs text-white/60 hover:text-white/90 transition-colors"
              onClick={() => router.push('/main/library?create=playlist')}
              type="button"
            >
              <Plus size={18} />
              <span>Создать</span>
            </button>
          </div>
        </nav>

        <Player />
      </div>
    )
  }

  return (
    <div className="h-screen bg-background text-text">
      <MainHeader />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          hasPlayer ? 'h-[calc(100vh-64px-90px)]' : 'h-[calc(100vh-64px)]',
        )}
      >
        <div
          className="grid h-full w-full overflow-hidden"
          ref={shellRef}
          style={{ gridTemplateColumns }}
        >
          <aside className="min-w-0 overflow-hidden rounded-lg bg-background-secondary m-1.5">
            <div className="h-full overflow-hidden">
              <LeftSidebar
                isCollapsed={isLibraryCollapsed}
                isExpanded={isLibraryExpanded}
                onToggleCollapsed={handleToggleLibraryCollapsed}
                onToggleExpanded={handleToggleLibraryExpanded}
              />
            </div>
          </aside>

          <hr
            aria-label="Resize library"
            aria-orientation="vertical"
            aria-valuemax={leftResizeLimits.max}
            aria-valuemin={leftResizeLimits.min}
            aria-valuenow={Math.round(leftResizeLimits.value)}
            className="relative h-full w-full cursor-col-resize border-0 bg-transparent before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors hover:before:bg-white/25 active:before:bg-[var(--color-spotify-green)]"
            onPointerDown={handleStartLeftResize}
            tabIndex={0}
          />

          <main className="min-w-0 overflow-hidden">{children}</main>

          {hasRightSidebar && (
            <hr
              aria-label="Resize now playing"
              aria-orientation="vertical"
              aria-valuemax={rightResizeLimits.max}
              aria-valuemin={rightResizeLimits.min}
              aria-valuenow={Math.round(rightResizeLimits.value)}
              className={cn(
                'relative h-full w-full cursor-col-resize border-0 bg-transparent before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors hover:before:bg-white/25 active:before:bg-[var(--color-spotify-green)]',
                isRightSidebarCollapsed &&
                  'cursor-default hover:bg-transparent',
              )}
              onPointerDown={handleStartRightResize}
              tabIndex={0}
            />
          )}

          {hasRightSidebar && (
            <aside className="relative min-w-0 overflow-hidden rounded-lg bg-background-secondary m-1.5">
              <div className="h-full overflow-hidden">
                <RightSidebar onCollapse={handleCollapseRightSidebar} />
              </div>
              {isRightSidebarCollapsed && (
                <button
                  aria-label="Expand sidebar"
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-lg cursor-pointer bg-background-secondary opacity-100 hover:opacity-80 transition-opacity duration-300 ease-in-out"
                  onClick={handleExpandRightSidebar}
                  type="button"
                >
                  <ChevronLeft className="text-gray-300 w-5 h-5 transition-transform duration-300 hover:scale-110" />
                </button>
              )}
            </aside>
          )}
        </div>
      </div>
      <Player />
    </div>
  )
}
