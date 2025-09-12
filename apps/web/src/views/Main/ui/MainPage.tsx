import React from 'react'
import { MainHeader } from '@widgets/MainHeader'
import { ResizableLayout } from './ResizableLayout'

export const MainPage = () => {
  return (
    <div className='h-screen bg-bg text-text'>
      <MainHeader />
      <ResizableLayout />
    </div>
  )
}
