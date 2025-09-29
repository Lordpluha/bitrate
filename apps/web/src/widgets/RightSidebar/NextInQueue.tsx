import { Typography } from '@spotify/ui'
import React from 'react'

export const NextInQueue: React.FC = () => (
  <div className='bg-surface rounded-lg p-0 overflow-hidden mt-4'>
    <div className='flex items-center justify-between px-4 pt-3 pb-1'>
      <Typography.Paragraph className='text-text text-sm font-semibold'>Next in queue</Typography.Paragraph>
      <button className='text-grey-500 text-xs font-medium hover:underline'>
        Open queue
      </button>
    </div>
    <div className='px-4 pb-4 flex items-center gap-3'>
      <img
        src='/images/drive-cover.jpg'
        alt='Empathy'
        className='w-12 h-12 rounded-md object-cover'
      />
      <div>
        <Typography.Paragraph className='text-text text-sm'>Empathy</Typography.Paragraph>
        <Typography.Paragraph className='text-grey-500 text-xs'>Crystal Castles</Typography.Paragraph>
      </div>
    </div>
  </div>
)
