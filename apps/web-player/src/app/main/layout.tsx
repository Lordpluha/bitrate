'use client'

import { cn } from '@bitrate/ui-react'
import { selectCurrentTrack, usePlayerStore } from '@entities/Player'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainHeader } from '@widgets/MainHeader'
import { Player } from '@widgets/Player'
import { RightSidebar } from '@widgets/RightSidebar'
import { ChevronLeft } from 'lucide-react'
import { type PropsWithChildren, useState } from 'react'
import { MobileBottomNavigation } from './MobileBottomNavigation'
import { useMainShellResize } from './useMainShellResize'

export default function MainLayout({ children }: PropsWithChildren) {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const hasPlayer = !!currentTrack
  const [isMobileCreateOpen, setIsMobileCreateOpen] = useState(false)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false)
  const {
    gridTemplateColumns,
    handleCollapseRightSidebar,
    handleExpandRightSidebar,
    handleToggleLibraryCollapsed,
    handleToggleLibraryExpanded,
    hasRightSidebar,
    isLibraryCollapsed,
    isLibraryExpanded,
    isResizing,
    isRightSidebarCollapsed,
    leftResizeHandleProps,
    leftResizeLimits,
    rightResizeHandleProps,
    rightResizeLimits,
    shellRef,
  } = useMainShellResize({ hasPlayer })

  return (
    <div className="h-dvh overflow-hidden bg-background text-text xl:h-screen xl:overflow-visible">
      <MainHeader onCreate={() => setIsMobileCreateOpen(true)} />

      <div
        className={cn(
          'h-[calc(100dvh-64px)] overflow-y-auto custom-scrollbar',
          hasPlayer ? 'pb-40' : 'pb-20',
          'xl:overflow-hidden xl:pb-0 xl:grid xl:w-full',
          /* Animate only the collapse/expand buttons. During a drag the same
             transition makes the sidebar chase the cursor 300ms behind it. */
          !isResizing && 'transition-all duration-300 ease-in-out',
          hasPlayer
            ? 'xl:h-[calc(100vh-64px-90px)]'
            : 'xl:h-[calc(100vh-64px)]',
          isResizing && 'xl:cursor-col-resize xl:select-none',
        )}
        ref={shellRef}
        style={{ gridTemplateColumns }}
      >
        <aside className="hidden min-w-0 overflow-hidden rounded-lg bg-background-secondary m-1.5 xl:block">
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
          className="relative hidden h-full w-full cursor-col-resize border-0 bg-transparent outline-none before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors hover:before:bg-white/25 focus-visible:before:bg-white/40 active:before:bg-primary xl:block"
          tabIndex={0}
          {...leftResizeHandleProps}
        />

        <main className="min-w-0 xl:overflow-hidden">{children}</main>

        {hasRightSidebar && (
          <hr
            aria-label="Resize now playing"
            aria-orientation="vertical"
            aria-valuemax={rightResizeLimits.max}
            aria-valuemin={rightResizeLimits.min}
            aria-valuenow={Math.round(rightResizeLimits.value)}
            className={cn(
              'relative h-full w-full cursor-col-resize border-0 bg-transparent outline-none before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors hover:before:bg-white/25 focus-visible:before:bg-white/40 active:before:bg-primary',
              isRightSidebarCollapsed && 'cursor-default hover:bg-transparent',
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
                <ChevronLeft className="text-muted-foreground w-5 h-5 transition-transform duration-300 hover:scale-110" />
              </button>
            )}
          </aside>
        )}
      </div>

      {!isPlayerExpanded && (
        <div className="xl:hidden">
          <MobileBottomNavigation
            isCreateOpen={isMobileCreateOpen}
            onCreateOpenChange={setIsMobileCreateOpen}
          />
        </div>
      )}

      <Player
        isExpanded={isPlayerExpanded}
        onExpandedChange={setIsPlayerExpanded}
      />
    </div>
  )
}
