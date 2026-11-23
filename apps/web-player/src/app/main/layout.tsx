'use client'

import { cn } from '@bitrate/ui-react'
import { selectCurrentTrack, usePlayerStore } from '@entities/Player'
import { LegalReacceptanceDialog } from '@features/Auth/ui/LegalReacceptanceDialog'
import { BitrateConnectSync } from '@features/BitrateConnect'
import { AccountSettingsSync } from '@features/SyncSettings'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainHeader } from '@widgets/MainHeader'
import { MobileIsland } from '@widgets/MobileIsland'
import { Player } from '@widgets/Player'
import { RightSidebar } from '@widgets/RightSidebar'
import { ChevronLeft } from 'lucide-react'
import { type PropsWithChildren, useState } from 'react'
import { useI18n } from '@/shared/i18n'
import { useMainShellResize } from './useMainShellResize'

/** The skip link's target; the page content that follows the header and the library. */
const MAIN_CONTENT_ID = 'main-content'

export default function MainLayout({ children }: PropsWithChildren) {
  const { t } = useI18n()
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const hasPlayer = !!currentTrack
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
    <div className="h-dvh overflow-hidden bg-background text-foreground xl:flex xl:h-screen xl:flex-col xl:gap-3 xl:p-4">
      <a
        className="sr-only z-50 rounded-lg bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href={`#${MAIN_CONTENT_ID}`}
      >
        {t('shell.skipToContent')}
      </a>
      <MainHeader />
      <LegalReacceptanceDialog />
      <BitrateConnectSync />
      <AccountSettingsSync />

      <div
        className={cn(
          'h-[calc(100dvh-64px)] overflow-y-auto custom-scrollbar',
          /* Room for the floating island: 66px + its 18px offset + a breath. */
          'pb-28',
          /* The design's workspace: one rounded card holding the library, the page and Now
             Playing; the floating player bar (88px + the 12px gap) sits below it. */
          'xl:grid xl:h-auto xl:min-h-0 xl:grid-rows-[minmax(0,1fr)] xl:w-full xl:flex-1 xl:overflow-hidden xl:rounded-2xl xl:border xl:border-border xl:bg-background-secondary xl:pb-0 xl:shadow-2xl',
          /* Animate only the collapse/expand buttons. During a drag the same
             transition makes the sidebar chase the cursor 300ms behind it. */
          !isResizing && 'transition-all duration-300 ease-in-out',
          hasPlayer && 'xl:mb-25',
          isResizing && 'xl:cursor-col-resize xl:select-none',
        )}
        ref={shellRef}
        style={{ gridTemplateColumns }}
      >
        <aside className="hidden min-w-0 overflow-hidden border-r border-border xl:block">
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
          aria-label={t('shell.resizeLibrary')}
          aria-orientation="vertical"
          aria-valuemax={leftResizeLimits.max}
          aria-valuemin={leftResizeLimits.min}
          aria-valuenow={Math.round(leftResizeLimits.value)}
          className="relative hidden h-full w-full cursor-col-resize border-0 bg-transparent outline-hidden before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors hover:before:bg-border focus-visible:before:bg-ring active:before:bg-primary xl:block"
          tabIndex={0}
          {...leftResizeHandleProps}
        />

        <main
          className="min-w-0 focus:outline-hidden xl:overflow-hidden"
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
        >
          {children}
        </main>

        {hasRightSidebar && (
          <hr
            aria-label={t('shell.resizeNowPlaying')}
            aria-orientation="vertical"
            aria-valuemax={rightResizeLimits.max}
            aria-valuemin={rightResizeLimits.min}
            aria-valuenow={Math.round(rightResizeLimits.value)}
            className={cn(
              'relative h-full w-full cursor-col-resize border-0 bg-transparent outline-hidden before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors hover:before:bg-border focus-visible:before:bg-ring active:before:bg-primary',
              isRightSidebarCollapsed && 'cursor-default hover:bg-transparent',
            )}
            tabIndex={0}
            {...rightResizeHandleProps}
          />
        )}

        {hasRightSidebar && (
          <aside className="relative min-w-0 overflow-hidden border-l border-border">
            <div className="h-full overflow-hidden">
              <RightSidebar onCollapse={handleCollapseRightSidebar} />
            </div>
            {isRightSidebarCollapsed && (
              <button
                aria-label="Expand sidebar"
                className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-background-secondary opacity-100 hover:opacity-80 transition-opacity duration-300 ease-in-out"
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
        <MobileIsland
          className="xl:hidden"
          onExpand={() => setIsPlayerExpanded(true)}
        />
      )}

      <Player
        isExpanded={isPlayerExpanded}
        onExpandedChange={setIsPlayerExpanded}
      />
    </div>
  )
}
