import { RecentsIcon, SearchIcon } from '@spotify/ui-react'

export const LibraryControls = () => {
  return (
    <div className="mt-4 flex gap-2 justify-between items-center">
      <button className="duration-200 hover:opacity-70" type="button">
        <SearchIcon />
      </button>
      <button
        className="duration-200 flex items-center gap-2 hover:opacity-70"
        type="button"
      >
        <span>Recents</span>
        <RecentsIcon />
      </button>
    </div>
  )
}
