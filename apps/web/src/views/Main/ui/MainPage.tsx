import React from 'react'
import { Typography } from '@spotify/ui'

export const MainPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center'>
        <Typography.Heading1 className='text-primary mb-4'>
          Main
        </Typography.Heading1>
      </div>
    </div>
  )
}
