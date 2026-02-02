import React from 'react'
import { Button, Typography } from '@spotify/ui-react'

export const AboutArtist: React.FC = () => (
  <div className="relative bg-surface rounded-lg overflow-hidden mt-4">
    <Typography
      as="h6"
      size="heading6"
      className="text-text absolute top-4 left-4"
    >
      About the artist
    </Typography>
    <img
      src="/images/michael-jackson-2.jpg"
      alt="Michael Jackson"
      className="w-full object-cover"
    />
    <div className="flex flex-col p-4">
      <Typography
        as="h6"
        size="heading6"
        className="text-text font-semibold text-base mb-1"
      >
        Michael Jackson
      </Typography>
      <div className="flex items-center justify-between">
        <Typography as="p" size="body" className="text-grey-500  text-xs">
          52 299 663 слушателя <br /> за месяц
        </Typography>
        <Button className="h-auto text-xs px-2 py-1" variant="outline">
          Subscribe
        </Button>
      </div>
      <Typography as="p" size="body" className="text-grey-500 text-xs mt-2">
        Michael Jackson helped shape the sound and style of the 1970s and '80s
        and was one of the 20th century's defining stars, an artist and
        all-around entertainer who…
      </Typography>
    </div>
  </div>
)
