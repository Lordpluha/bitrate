"use client"

import { useAppSelector } from '@shared/hooks'
import { MainHeader } from '@widgets/MainHeader'
import { Player } from '@widgets/Player'
import { ResizableLayout as ResizableLayoutShadCN, ResizablePanel, ResizableHandle } from '@spotify/ui-react'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainPanel } from '@widgets/MainPanel'
import { RightSidebar } from '@widgets/RightSidebar'
import styles from './ResizableLayout.module.css'


export const MainView: React.FC = () => {
  const { currentTrack } = useAppSelector((state) => state.musicPlayer)
  const hasPlayer = !!currentTrack

  return (
    <div className='h-screen bg-bg text-text'>
      <MainHeader />
      <div
        className='transition-all duration-300 ease-in-out'
        style={{
          height: hasPlayer ? 'calc(100vh - 64px - 90px)' : 'calc(100vh - 64px)'
        }}
      >
        <div className='h-full'>
          <ResizableLayoutShadCN className='h-full' direction='horizontal'>
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={30}
              className={`${styles['resizable-layout__panel']} ${styles['resizable-layout__sidebar--left']}`}
            >
              <LeftSidebar />
            </ResizablePanel>

            <ResizableHandle className={styles['resizable-layout__handle']} />

            <ResizablePanel
              defaultSize={60}
              minSize={40}
              className={`${styles['resizable-layout__panel']} ${styles['resizable-layout__content']}`}
            >
              <MainPanel />
            </ResizablePanel>

            <ResizableHandle className={styles['resizable-layout__handle']} />

            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={30}
              className={`${styles['resizable-layout__panel']} ${styles['resizable-layout__sidebar--right']}`}
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

