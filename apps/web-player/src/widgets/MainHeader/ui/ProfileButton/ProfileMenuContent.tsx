import { ROUTES } from '@shared/routes'
import { Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

type ProfileMenuContentProps = {
  isLogoutPending: boolean
  onLogout: () => void
}

export const ProfileMenuContent = ({
  isLogoutPending,
  onLogout,
}: ProfileMenuContentProps) => (
  <>
    <nav aria-label="Profile">
      <ProfileMenuLink
        href={ROUTES.settings}
        icon={<ExternalLink aria-hidden="true" size={16} />}
        label="Account"
      />
      <ProfileMenuLink href={ROUTES.profile} label="Profile" />
      <ProfileMenuLink href={ROUTES.recents} label="Recents" />
      <ProfileMenuLink
        href="#support"
        icon={<ExternalLink aria-hidden="true" size={16} />}
        label="Support"
      />
      <ProfileMenuLink
        href={ROUTES.download}
        icon={<ExternalLink aria-hidden="true" size={16} />}
        label="Download"
      />
      <ProfileMenuLink href={ROUTES.settings} label="Settings" />
    </nav>
    <button
      className="flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLogoutPending}
      onClick={onLogout}
      type="button"
    >
      {isLogoutPending ? 'Logging out...' : 'Log out'}
    </button>

    <div className="mx-1 my-1 border-t border-white/10" />
    <section className="px-3 py-4">
      <h3 className="text-base font-bold text-text">Your Updates</h3>
      <div className="grid justify-items-center py-7 text-center">
        <Check aria-hidden="true" className="mb-3 text-text" size={36} />
        <p className="font-bold text-text">You're all caught up</p>
        <p className="mt-2 max-w-60 text-xs leading-5 text-text-subdued">
          Watch this space for news on your followers, playlists, events and
          more.
        </p>
      </div>
    </section>
  </>
)

type ProfileMenuLinkProps = {
  href: string
  icon?: ReactNode
  label: string
}

const ProfileMenuLink = ({ href, icon, label }: ProfileMenuLinkProps) => (
  <Link
    className="flex items-center justify-between rounded-sm px-3 py-2.5 transition-colors hover:bg-white/10"
    href={href}
  >
    {label}
    {icon}
  </Link>
)
