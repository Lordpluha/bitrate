import { CurrentPlaylist } from './CurrentPlaylist'
import { AboutArtist } from './AboutArtist'
import { Credits } from './Credits'
import { NextInQueue } from './NextInQueue'

interface RightSidebarProps {
  onCollapse?: () => void
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onCollapse }) => {
  return (
    <div className="h-full py-4 px-6 overflow-y-auto custom-scrollbar group/sidebar relative">
      <CurrentPlaylist onCollapse={onCollapse} />
      <AboutArtist />
      {/* <Credits /> */}
      <NextInQueue />
    </div>
  )
}
