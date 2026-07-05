import { ROUTES } from '@shared/routes'
import { PlusIcon, Typography } from '@spotify/ui-react'
import { Maximize2, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import Link from 'next/link'

type LibraryHeaderProps = {
  isCollapsed?: boolean
  isExpanded?: boolean
  onToggleCollapsed?: () => void
  onToggleExpanded?: () => void
}

export const LibraryHeader = ({
  isCollapsed = false,
  isExpanded = false,
  onToggleCollapsed,
  onToggleExpanded,
}: LibraryHeaderProps) => {
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          aria-label="Open Your Library"
          className="rounded-md p-2 text-text-subdued transition-colors hover:bg-surface hover:text-text"
          onClick={onToggleCollapsed}
          title="Open Your Library"
          type="button"
        >
          <PanelLeftOpen size={22} />
        </button>
        <Link
          aria-label="Create playlist"
          className="rounded-full bg-surface p-3 text-text transition-colors hover:bg-surface-hover"
          href={ROUTES.createPlaylist}
          title="Create"
        >
          <PlusIcon />
        </Link>
      </div>
    )
  }

  return (
    <div className="group/header flex gap-2 justify-between items-center">
      <div className="flex min-w-0 items-center">
        <div className="w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-200 ease-out group-hover/header:w-8 group-hover/header:opacity-100">
          <button
            aria-label="Collapse Your Library"
            className="mr-2 rounded p-1 text-text-subdued transition-colors hover:bg-surface hover:text-text"
            onClick={onToggleCollapsed}
            title="Collapse Your Library"
            type="button"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <Typography as="h6" className="truncate" size="heading6">
          Your Library
        </Typography>
      </div>
      <div className="flex gap-2 items-center">
        <Link
          className="px-4 py-2 rounded-full duration-200 flex items-center gap-2 bg-surface hover:opacity-70"
          href={ROUTES.createPlaylist}
        >
          <PlusIcon />
          <span className="font-bold">Create</span>
        </Link>
        <button
          aria-label={
            isExpanded ? 'Collapse Your Library' : 'Expand Your Library'
          }
          className="duration-200 hover:opacity-70"
          onClick={onToggleExpanded}
          title={isExpanded ? 'Collapse Your Library' : 'Expand Your Library'}
          type="button"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  )
}
