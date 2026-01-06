// import { ReviewIcon, SearchIcon } from '@shared/ui'
import { Input } from '@spotify/ui-react'
import React from 'react'

export const HeaderSearch = () => {
  return (
    <div className='relative w-[400px]'>
      {/* <SearchIcon className='absolute left-4 top-1/2 transform -translate-y-1/2 text-black z-10' /> */}
      <Input
        type='text'
        placeholder='What do you want to play?'
        className='w-full'
      />
      <div className='pl-2 border-l-2 border-grey-400 absolute right-4 top-1/2 transform -translate-y-1/2'>
        {/* <ReviewIcon /> */}
      </div>
    </div>
  )
}
