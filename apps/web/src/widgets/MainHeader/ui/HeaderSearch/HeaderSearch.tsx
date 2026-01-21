import { ReviewIcon, SearchIcon } from '@spotify/ui-react'
import { Input } from '@spotify/ui-react'
import React from 'react'

export const HeaderSearch = () => {
  return (
    <div className='relative w-[400px]'>
      <SearchIcon className='absolute left-4 top-1/2 transform -translate-y-1/2 text-grey-500 z-10' width={20} height={20} />
      <Input
        type='text'
        placeholder='What do you want to play?'
        variant='search'
        className='pl-12'
      />
      <div className='pl-2 border-l-2 border-grey-600 absolute right-4 top-1/2 transform -translate-y-1/2'>
        <ReviewIcon width={20} height={20} className='text-grey-500' />
      </div>
    </div>
  )
}
