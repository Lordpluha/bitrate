import { AboutArtist } from './AboutArtist'
import { Credits } from './Credits'
import { CurrentPlaylist } from './CurrentPlaylist'
import { NextInQueue } from './NextInQueue'

interface RightSidebarProps {
  onCollapse?: () => void
}

export const RightSidebar = ({ onCollapse }: RightSidebarProps) => {
  return (
    <div className="group/sidebar relative h-full min-w-65 overflow-x-hidden overflow-y-auto px-4 py-4 custom-scrollbar">
      <CurrentPlaylist onCollapse={onCollapse} />
      <AboutArtist />
      <Credits />
      <NextInQueue />
    </div>
  )
}
