import { MoreHorizontal, Settings } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'

export const ProfileActions = () => (
  <div className="mb-10 flex items-center gap-6 text-text-subdued">
    <Link
      aria-label="Open settings"
      className="transition-colors hover:text-text"
      href={ROUTES.settings}
    >
      <Settings size={28} />
    </Link>
    <button
      aria-label="More profile options"
      className="transition-colors hover:text-text"
      type="button"
    >
      <MoreHorizontal size={30} />
    </button>
  </div>
)
