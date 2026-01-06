"use client"

import React from 'react'
import { useSelector } from 'react-redux'
import { MainHeader } from '@widgets/MainHeader'
import { Player } from '@widgets/Player'
import type { RootState } from '@shared/store'
import { ResizableLayout as ResizableLayoutShadCN, ResizablePanel, ResizableHandle } from '@spotify/ui-react'
import { LeftSidebar } from '@widgets/LeftSidebar'
import { MainPanel } from '@widgets/MainPanel'
import { RightSidebar } from '@widgets/RightSidebar'
import styles from './ResizableLayout.module.css'


export const MainView: React.FC = () => {
  const { currentTrack } = useSelector((state: RootState) => state.musicPlayer)
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
              className={`${styles.panel} ${styles.leftSidebar}`}
            >
              <LeftSidebar />
            </ResizablePanel>

            <ResizableHandle className={styles.resizeHandle} />

            <ResizablePanel
              defaultSize={60}
              minSize={40}
              className={`${styles.panel} ${styles.mainContent}`}
            >
              <MainPanel />
            </ResizablePanel>

            <ResizableHandle className={styles.resizeHandle} />

            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={30}
              className={`${styles.panel} ${styles.rightSidebar}`}
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

