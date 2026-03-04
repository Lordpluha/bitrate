import { LibraryControls } from './LibraryControls'
import { LibraryHeader } from './LibraryHeader'
import { LibraryMusic } from './LibraryMusic'
import { LibraryTags } from './LibraryTags'

export const LeftSidebar = () => {
  return (
    <div className="h-full p-4 flex flex-col">
      <LibraryHeader />
      <LibraryTags />
      <LibraryControls />
      <LibraryMusic />
    </div>
  )
}
