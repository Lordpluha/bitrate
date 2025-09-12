import React from 'react'
import { Typography } from '@spotify/ui'
import { ExpandIcon, PlusIcon } from '@shared/ui'

export const LibraryHeader = () => {
  return (
    <div className='flex gap-2 justify-between items-center'>
      <Typography.Heading6 className=''>Your Library</Typography.Heading6>
      <div className='flex gap-2 items-center'>
        <button className='px-4 py-2 rounded-full duration-200 flex items-center gap-2 bg-surface hover:opacity-70'>
          <PlusIcon />
          <span className='font-bold'>Create</span>
        </button>
        <button className='duration-200 hover:opacity-70'>
          <ExpandIcon />
        </button>
      </div>
    </div>
  )
}
