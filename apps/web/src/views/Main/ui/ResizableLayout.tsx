import React from 'react'
import { ResizableLayout as ResizableLayoutShadCN, ResizablePanel, ResizableHandle, Typography } from '@spotify/ui'

import styles from './ResizableLayout.module.scss'
import { LeftSidebar } from '../../../widgets/LeftSidebar'

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
          <div className='p-4'>
            <Typography.Heading3 className='text-white mb-4'>
              Main Content
            </Typography.Heading3>
          </div>
        </ResizablePanel>

        <ResizableHandle className={styles.resizeHandle} />

        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          className={`${styles.panel} ${styles.rightSidebar}`}
        >
          <div className='p-4'>
            <Typography.Heading3 className='text-white mb-4'>
              Right Sidebar
            </Typography.Heading3>
          </div>
        </ResizablePanel>
      </ResizableLayoutShadCN>
    </div>
  )
}
