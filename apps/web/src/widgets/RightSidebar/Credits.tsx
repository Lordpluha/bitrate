import React from 'react'
import { Button, Typography } from '@spotify/ui'

export const Credits: React.FC = () => (
  <div className='bg-surface rounded-lg p-0 overflow-hidden mt-4'>
    <div className='flex items-center justify-between px-4 pt-3 pb-1'>
      <div className='text-text text-sm font-semibold'>Credits</div>
      <button className='text-grey-500 text-xs font-medium hover:underline'>
        Show all
      </button>
    </div>
    <div className='px-4 pb-4'>
      <div className='flex items-center justify-between mb-2'>
        <div>
          <Typography.Paragraph className='text-text text-sm'>Crystal Castles</Typography.Paragraph>
          <Typography.Paragraph className='text-grey-500  text-xs'>Main Artist</Typography.Paragraph>
        </div>
        <Button className='h-auto text-xs px-2 py-1' variant='subscribe'>Follow</Button>
      </div>
      <div className='mb-2'>
        <Typography.Paragraph className='text-text text-sm'>Van She</Typography.Paragraph>
        <Typography.Paragraph className='text-grey-500  text-xs'>Composer</Typography.Paragraph>
      </div>
      <div>
        <Typography.Paragraph className='text-text text-sm'>Ethan Kath</Typography.Paragraph>
        <Typography.Paragraph className='text-grey-500 text-xs'>Composer, Producer</Typography.Paragraph>
      </div>
    </div>
  </div>
)
