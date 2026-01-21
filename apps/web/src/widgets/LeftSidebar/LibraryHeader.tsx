import { ExpandIcon, PlusIcon, Typography } from '@spotify/ui-react'
import {  Maximize2 } from 'lucide-react'

export const LibraryHeader = () => {
  return (
    <div className='flex gap-2 justify-between items-center'>
      <Typography as='h6' size='heading6' className=''>Your Library</Typography>
      <div className='flex gap-2 items-center'>
        <button className='px-4 py-2 rounded-full duration-200 flex items-center gap-2 bg-surface hover:opacity-70' type='button'>
          <PlusIcon />
          <span className='font-bold'>Create</span>
        </button>
        <button className='duration-200 hover:opacity-70' type='button'>
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  )
}
