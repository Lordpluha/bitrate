'use client'

import { useAppSelector } from '@shared/hooks'
import { MainHeader } from '@widgets/MainHeader'
import { Player } from '@widgets/Player'
import {
  ResizableLayout as ResizableLayoutShadCN,
  ResizablePanel,
  ResizableHandle,
} from '@spotify/ui-react'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainPanel } from '@widgets/MainPanel'
import { RightSidebar } from '@widgets/RightSidebar'

export const MainView: React.FC = () => {
  const { currentTrack } = useAppSelector((state) => state.musicPlayer)
  const hasPlayer = !!currentTrack

  return (
    <div className="h-screen bg-bg text-text">
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
              className='overflow-hidden rounded-lg bg-bg-secondary m-1.5 relative before:content-[""] before:absolute before:inset-0 before:bg-gradient-to-b before:from-[#1a0f2e] before:via-[var(--violet-main-panel)] before:via-10% before:to-bg-secondary before:to-20% before:rounded-lg before:pointer-events-none before:z-0'
            >
              <MainPanel />
            </ResizablePanel>

            <ResizableHandle className="w-0 bg-white/10 transition-all duration-200 ease cursor-col-resize relative hover:w-[6px] hover:bg-[var(--color-spotify-green-hover)] active:bg-[var(--color-spotify-green)]" />

            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={30}
              className="overflow-hidden rounded-lg bg-bg-secondary m-1.5"
            >
              <RightSidebar />
            </ResizablePanel>
          </ResizableLayoutShadCN>
        </div>
      </div>
      <Player />
    </div>
  )
}
