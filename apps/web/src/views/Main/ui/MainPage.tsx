"use client"

import React from 'react'
import { useSelector } from 'react-redux'
import { MainHeader } from '@widgets/MainHeader'
import { ResizableLayout } from './ResizableLayout'
import { Player } from '@widgets/Player'
import type { RootState } from '@shared/store'


export const MainPage: React.FC = () => {
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
        <ResizableLayout />
      </div>
      <Player />
    </div>
  )
}
