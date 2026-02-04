'use client'

import { useAppSelector } from '@shared/hooks'
import {
  ResizableHandle,
  ResizableLayout as ResizableLayoutShadCN,
  ResizablePanel,
} from '@spotify/ui-react'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainHeader } from '@widgets/MainHeader'
import { Player } from '@widgets/Player'
import { RightSidebar } from '@widgets/RightSidebar'
import { useState, useEffect } from 'react'
import type { PropsWithChildren } from 'react'

export default function MainLayout({ children }: PropsWithChildren) {
  const { currentTrack } = useAppSelector((state) => state.musicPlayer)
  const hasPlayer = !!currentTrack
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(true)

  // Auto-expand sidebar when player becomes active
  useEffect(() => {
    if (hasPlayer && isRightSidebarCollapsed) {
      setIsRightSidebarCollapsed(false)
    }
  }, [hasPlayer])

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
              defaultSize={20}
              minSize={15}
              maxSize={30}
              className="overflow-hidden rounded-lg bg-bg-secondary m-1.5"
            >
              <LeftSidebar />
            </ResizablePanel>

            <ResizableHandle className="w-0 bg-white/10 transition-all duration-200 ease cursor-col-resize relative hover:w-[6px] hover:bg-[var(--color-spotify-green-hover)] active:bg-[var(--color-spotify-green)]" />

            <ResizablePanel
              defaultSize={60}
              minSize={40}
              className="overflow-hidden rounded-lg bg-background-secondary m-1.5 relative"
            >
              {children}
            </ResizablePanel>

            <ResizableHandle className="w-0 bg-white/10 transition-all duration-200 ease cursor-col-resize relative hover:w-[6px] hover:bg-[var(--color-spotify-green-hover)] active:bg-[var(--color-spotify-green)]" />

            {!isRightSidebarCollapsed && (
              <>
                <ResizableHandle className="w-0 bg-white/10 transition-all duration-200 ease cursor-col-resize relative hover:w-[6px] hover:bg-[var(--color-spotify-green-hover)] active:bg-[var(--color-spotify-green)]" />

                <ResizablePanel
                  defaultSize={20}
                  minSize={15}
                  maxSize={30}
                  className="overflow-hidden rounded-lg bg-background-secondary m-1.5"
                >
                  <RightSidebar
                    onCollapse={() => setIsRightSidebarCollapsed(true)}
                  />
                </ResizablePanel>
              </>
            )}
            {isRightSidebarCollapsed && hasPlayer && (
              <button
                onClick={() => setIsRightSidebarCollapsed(false)}
                className="fixed right-4 top-20 z-50 p-2 rounded-lg bg-background-secondary hover:bg-gray-700/50 transition-colors"
                aria-label="Expand sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="text-gray-400 hover:text-white transition-colors rotate-180"
                >
                  <path
                    fill="currentColor"
                    d="M5.026 10.524a.75.75 0 1 1-1.059-1.06l1.47-1.469-1.47-1.469a.75.75 0 0 1 1.06-1.06l1.998 2a.75.75 0 0 1 0 1.059z"
                  />
                  <path
                    fill="currentColor"
                    d="M1 0a1 1 0 0 0-1 1v13.99a1 1 0 0 0 1 1h13.99a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm.499 1.499h7.995v12.992H1.499zm12.992 12.992h-3.498V1.499h3.498z"
                  />
                </svg>
              </button>
            )}
          </ResizableLayoutShadCN>
        </div>
      </div>
      <Player />
    </div>
  )
}
