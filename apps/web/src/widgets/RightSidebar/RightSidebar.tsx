
import { FavoriteTracks } from './FavoriteTracks'
import { AboutArtist } from './AboutArtist'
import { Credits } from './Credits'
import { NextInQueue } from './NextInQueue'

export const RightSidebar: React.FC = () => {
  return (
    <div className='h-full py-4 px-6 overflow-y-auto custom-scrollbar'>
      <FavoriteTracks />
      <AboutArtist />
      <Credits />
      <NextInQueue />
    </div>
  )
}
