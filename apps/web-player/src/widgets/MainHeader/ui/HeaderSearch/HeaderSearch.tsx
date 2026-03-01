import { Input, ReviewIcon, SearchIcon } from '@spotify/ui-react'
import React from 'react'

export const HeaderSearch = () => {
  return (
    <div className="relative w-[400px]">
      <SearchIcon
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-grey-500 z-10"
        height={20}
        width={20}
      />
      <Input
        className="pl-12"
        placeholder="What do you want to play?"
        type="text"
        variant="search"
      />
      <div className="pl-2 border-l-2 border-grey-600 absolute right-4 top-1/2 transform -translate-y-1/2">
        <ReviewIcon className="text-grey-500" height={20} width={20} />
      </div>
    </div>
  )
}
