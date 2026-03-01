'use client'

import { useAppSelector } from '@shared/hooks'
import {
  ResizableHandle,
  ResizableLayout as ResizableLayoutShadCN,
  ResizablePanel,
  RollupIcon,
} from '@spotify/ui-react'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainHeader } from '@widgets/MainHeader'
import { Player } from '@widgets/Player'
import { RightSidebar } from '@widgets/RightSidebar'
import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'

export default function MainLayout({ children }: PropsWithChildren) {
  const { currentTrack } = useAppSelector((state) => state.musicPlayer)
  const hasPlayer = !!currentTrack
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(true)

  // Auto-expand sidebar when player becomes active
  useEffect(() => {
    if (hasPlayer && isRightSidebarCollapsed) {
      setIsRightSidebarCollapsed(false)
    }
  }, [hasPlayer, isRightSidebarCollapsed])

  return (
    <div className="h-screen bg-background text-text">
      <MainHeader />
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          height: hasPlayer
            ? 'calc(100vh - 64px - 90px)'
            : 'calc(100vh - 64px)',
        }}
      >
        <div className="h-full">
          <ResizableLayoutShadCN className="h-full" direction="horizontal">
            <ResizablePanel
              className="overflow-hidden rounded-lg bg-bg-secondary m-1.5"
              defaultSize={20}
              maxSize={30}
              minSize={15}
            >
              <LeftSidebar />
            </ResizablePanel>

            <ResizableHandle className="w-0 bg-white/10 transition-all duration-200 ease cursor-col-resize relative hover:w-[6px] hover:bg-[var(--color-spotify-green-hover)] active:bg-[var(--color-spotify-green)]" />

            <ResizablePanel
              className="overflow-hidden rounded-lg bg-background-secondary m-1.5 relative"
              defaultSize={60}
              minSize={40}
            >
              {children}
            </ResizablePanel>

            <ResizableHandle className="w-0 bg-white/10 transition-all duration-200 ease cursor-col-resize relative hover:w-[6px] hover:bg-[var(--color-spotify-green-hover)] active:bg-[var(--color-spotify-green)]" />

            {!isRightSidebarCollapsed && (
              <>
                <ResizableHandle className="w-0 bg-white/10 transition-all duration-200 ease cursor-col-resize relative hover:w-[6px] hover:bg-[var(--color-spotify-green-hover)] active:bg-[var(--color-spotify-green)]" />

                <ResizablePanel
                  className="overflow-hidden rounded-lg bg-background-secondary m-1.5"
                  defaultSize={20}
                  maxSize={30}
                  minSize={15}
                >
                  <RightSidebar
                    onCollapse={() => setIsRightSidebarCollapsed(true)}
                  />
                </ResizablePanel>
              </>
            )}
            {isRightSidebarCollapsed && hasPlayer && (
              <button
                aria-label="Expand sidebar"
                className="fixed right-4 top-20 z-50 p-2 rounded-lg bg-background-secondary hover:bg-gray-700/50 transition-colors"
                onClick={() => setIsRightSidebarCollapsed(false)}
                type="button"
              >
                <RollupIcon height={16} primaryColor={'#b3b3b3'} width={16} />
              </button>
            )}
          </ResizableLayoutShadCN>
        </div>
      </div>
      <Player />
    </div>
  )
}
