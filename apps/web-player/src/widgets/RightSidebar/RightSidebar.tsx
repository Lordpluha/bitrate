import { AboutArtist } from './AboutArtist'
import { Credits } from './Credits'
import { CurrentPlaylist } from './CurrentPlaylist'
import { NextInQueue } from './NextInQueue'

interface RightSidebarProps {
  onCollapse?: () => void
  /** The Up next list; the landing's demo leaves it out to keep the panel about the track. */
  showQueue?: boolean
}

export const RightSidebar = ({
  onCollapse,
  showQueue = true,
}: RightSidebarProps) => {
  return (
    <div className="group/sidebar relative flex h-full min-w-65 flex-col gap-3.5 overflow-x-hidden overflow-y-auto p-5 custom-scrollbar *:shrink-0">
      <CurrentPlaylist onCollapse={onCollapse} />
      {showQueue && <NextInQueue />}
      <AboutArtist />
      <Credits />
    </div>
  )
}
