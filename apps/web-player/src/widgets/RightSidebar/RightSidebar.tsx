import { AboutArtist } from './AboutArtist'
import { Credits } from './Credits'
import { CurrentPlaylist } from './CurrentPlaylist'
import { NextInQueue } from './NextInQueue'

interface RightSidebarProps {
  onCollapse?: () => void
}

export const RightSidebar = ({ onCollapse }: RightSidebarProps) => {
  return (
    <div className="group/sidebar relative flex h-full min-w-65 flex-col gap-3.5 overflow-x-hidden overflow-y-auto p-5 custom-scrollbar">
      <CurrentPlaylist onCollapse={onCollapse} />
      <NextInQueue />
      <AboutArtist />
      <Credits />
    </div>
  )
}
