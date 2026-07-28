'use client'

import { useAppSelector, useMediaQuery } from '@shared/hooks'
import { cn } from '@spotify/ui-react'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainHeader } from '@widgets/MainHeader'
import { Player } from '@widgets/Player'
import { RightSidebar } from '@widgets/RightSidebar'
import { ChevronLeft } from 'lucide-react'
import { type PropsWithChildren, useState } from 'react'
import { MobileBottomNavigation } from './MobileBottomNavigation'
import { useMainShellResize } from './useMainShellResize'

export default function MainLayout({ children }: PropsWithChildren) {
  const { currentTrack } = useAppSelector((state) => state.musicPlayer)
  const hasPlayer = !!currentTrack
  const isDesktop = useMediaQuery('(min-width: 1440px)')
  const isMobile = useMediaQuery('(max-width: 1279px)')
  const [isMobileCreateOpen, setIsMobileCreateOpen] = useState(false)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false)
  const hasRightSidebar = hasPlayer && isDesktop
  const {
    gridTemplateColumns,
    handleCollapseRightSidebar,
    handleExpandRightSidebar,
    handleToggleLibraryCollapsed,
    handleToggleLibraryExpanded,
    isLibraryCollapsed,
    isLibraryExpanded,
    isResizing,
    isRightSidebarCollapsed,
    leftResizeHandleProps,
    leftResizeLimits,
    rightResizeHandleProps,
    rightResizeLimits,
    shellRef,
  } = useMainShellResize({ hasRightSidebar })

  if (isMobile) {
    return (
      <div className="h-dvh overflow-hidden bg-background text-text">
        <MainHeader onCreate={() => setIsMobileCreateOpen(true)} />

        <div
          className={cn(
            'h-[calc(100dvh-4rem)] overflow-y-auto custom-scrollbar',
            hasPlayer
              ? 'pb-[calc(8.5rem+env(safe-area-inset-bottom))]'
              : 'pb-[calc(4rem+env(safe-area-inset-bottom))]',
          )}
        >
          {children}
        </div>

        {!isPlayerExpanded && (
          <MobileBottomNavigation
            isCreateOpen={isMobileCreateOpen}
            onCreateOpenChange={setIsMobileCreateOpen}
          />
        )}

        <Player
          isExpanded={isPlayerExpanded}
          onExpandedChange={setIsPlayerExpanded}
        />
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
          className={cn(
            'grid h-full w-full overflow-hidden',
            isResizing && 'cursor-col-resize select-none',
          )}
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
            className="relative h-full w-full cursor-col-resize border-0 bg-transparent outline-none before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors hover:before:bg-white/25 focus-visible:before:bg-white/40 active:before:bg-[var(--color-spotify-green)]"
            tabIndex={0}
            {...leftResizeHandleProps}
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
                'relative h-full w-full cursor-col-resize border-0 bg-transparent outline-none before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors hover:before:bg-white/25 focus-visible:before:bg-white/40 active:before:bg-[var(--color-spotify-green)]',
                isRightSidebarCollapsed &&
                  'cursor-default hover:bg-transparent',
              )}
              tabIndex={0}
              {...rightResizeHandleProps}
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
      <Player
        isExpanded={isPlayerExpanded}
        onExpandedChange={setIsPlayerExpanded}
      />
    </div>
  )
}
