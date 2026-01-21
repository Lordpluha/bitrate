import React from 'react'
import { Button, Typography } from '@spotify/ui-react'
import { LibraryHeader } from './LibraryHeader'
import { LibraryTags } from './LibraryTags'
import { LibraryControls } from './LibraryControls'
import { LibraryMusic } from './LibraryMusic'

export const LeftSidebar = () => {
  return (
    <div className='h-full p-4 flex flex-col'>
      <LibraryHeader />
      <LibraryTags />
      <LibraryControls />
      <LibraryMusic />
    </div>
  )
}
