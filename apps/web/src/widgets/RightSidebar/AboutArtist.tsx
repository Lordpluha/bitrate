import React from 'react'
import { Button, Typography } from '@spotify/ui'

export const AboutArtist: React.FC = () => (
  <div className='relative bg-surface rounded-lg overflow-hidden mt-4'>
    <Typography.Heading6 className='text-text absolute top-4 left-4'>
      About the artist
    </Typography.Heading6>
    <img
      src='/images/michael-jackson-2.jpg'
      alt='Michael Jackson'
      className='w-full object-cover'
    />
    <div className='flex flex-col p-4'>
      <Typography.Heading6 className='text-text font-semibold text-base mb-1'>Michael Jackson</Typography.Heading6>
      <div className='flex items-center justify-between'>
        <Typography.Paragraph className='text-grey-500  text-xs'>52 299 663 слушателя <br /> за месяц</Typography.Paragraph>
        <Button className='h-auto text-xs px-2 py-1' variant='subscribe'>Subscribe</Button>
      </div>
      <Typography.Paragraph className='text-grey-500 text-xs mt-2'>
        Michael Jackson helped shape the sound and style of the 1970s and
        '80s and was one of the 20th century's defining stars, an artist and
        all-around entertainer who…
      </Typography.Paragraph>
    </div>
  </div>
)
