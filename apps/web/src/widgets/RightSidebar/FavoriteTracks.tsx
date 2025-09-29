import React from 'react'
import { Typography } from '@spotify/ui'
import { SavedSongIcon } from '@shared/ui'

export const FavoriteTracks: React.FC = () => (
  <div>
    <Typography.Heading6 className='text-text'>Favorite tracks</Typography.Heading6>
    <div className='flex flex-col items-center pb-2 mt-1'>
      <img
        src='/images/michael-jackson-1.jpg'
        alt='Michael Jackson - Thriller'
        className='w-full rounded-md mb-2'
      />
      <div className='w-full'>
        <Typography.Paragraph className='text-grey-500'>Beat It</Typography.Paragraph>
        <div className='flex justify-between items-center gap-2'>
          <Typography.Paragraph className='text-green-500'>
            Michael Jackson
          </Typography.Paragraph>
          <SavedSongIcon />
        </div>
      </div>
    </div>
  </div>
)
