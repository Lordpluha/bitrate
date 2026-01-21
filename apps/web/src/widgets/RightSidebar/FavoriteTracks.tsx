import React from 'react'
import { Typography } from '@spotify/ui-react'
import { SavedSongIcon } from '@spotify/ui-react'

export const FavoriteTracks: React.FC = () => (
  <div>
    <Typography as='h6' size='heading6' className='text-text'>Favorite tracks</Typography>
    <div className='flex flex-col items-center pb-2 mt-1'>
      <img
        src='/images/michael-jackson-1.jpg'
        alt='Michael Jackson - Thriller'
        className='w-full rounded-md mb-2'
      />
      <div className='w-full'>
        <Typography as='p' size='body' className='text-grey-500'>Beat It</Typography>
        <div className='flex justify-between items-center gap-2'>
          <Typography as='p' size='body' className='text-green-500'>
            Michael Jackson
          </Typography>
          <SavedSongIcon />
        </div>
      </div>
    </div>
  </div>
)
