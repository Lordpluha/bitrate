import React from 'react'
import { ResizableLayout as ResizableLayoutShadCN, ResizablePanel, ResizableHandle } from '@spotify/ui'

import styles from './ResizableLayout.module.scss'

import { LeftSidebar } from '@/widgets/LeftSidebar'
import { MainPanel } from '@/widgets/MainPanel'
import { RightSidebar } from '@/widgets/RightSidebar'

export const ResizableLayout = () => {
  return (
    <div className='h-[calc(100vh-64px)]'>
      <ResizableLayoutShadCN className='h-[calc(100vh-64px)]' direction='horizontal'>
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
  )
}
