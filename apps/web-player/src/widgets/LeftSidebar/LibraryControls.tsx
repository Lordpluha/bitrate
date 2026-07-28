import { ROUTES } from '@shared/routes'
import { RecentsIcon, SearchIcon } from '@spotify/ui-react'
import Link from 'next/link'

export const LibraryControls = () => {
  return (
    <div className="mt-4 flex gap-2 justify-between items-center">
      <Link
        aria-label="Open search page"
        className="duration-200 hover:opacity-70"
        href={ROUTES.search()}
      >
        <SearchIcon />
      </Link>
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
