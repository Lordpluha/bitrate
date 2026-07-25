'use client'

import { useAuth } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { generateColor } from '@shared/utils'
import { getUserAvatarUrl } from '@shared/utils/mediaUrl'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@spotify/ui-react'
import { Check, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { FC, HTMLAttributes, ReactNode } from 'react'

interface ProfileButtonProps extends HTMLAttributes<HTMLDivElement> {
  avatar?: string | null
  username: string
}

export const ProfileButton: FC<ProfileButtonProps> = ({
  avatar,
  className,
  username,
  ...etcDivProps
}) => {
  const firstLetter = username.charAt(0).toUpperCase()
  const backgroundColor = generateColor(username)
  const avatarUrl = avatar ? getUserAvatarUrl(avatar) : null

  const { isLogoutPending, logout } = useAuth()

  return (
    <div className={className} {...etcDivProps}>
      <Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger className="h-12 w-12 rounded-full bg-grey-900 p-2 transition-transform duration-200 hover:scale-105">
                {avatarUrl ? (
                  <Image
                    alt={username}
                    className="h-full w-full rounded-full object-cover"
                    height={32}
                    src={avatarUrl}
                    unoptimized
                    width={32}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full text-xl font-semibold text-black"
                    style={{ backgroundColor }}
                  >
                    {firstLetter}
                  </div>
                )}
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>{username}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent
          align="end"
          className="!z-[1000] w-82 rounded-md !border-border !bg-popover p-1 text-sm !text-text shadow-2xl"
          positionerClassName="z-[1000]"
          sideOffset={8}
        >
          <ProfileMenuLink
            href={ROUTES.settings}
            icon={<ExternalLink size={16} />}
            label="Account"
          />
          <ProfileMenuLink href={ROUTES.profile} label="Profile" />
          <ProfileMenuLink href={ROUTES.recents} label="Recents" />
          <ProfileMenuLink
            href="#support"
            icon={<ExternalLink size={16} />}
            label="Support"
          />
          <ProfileMenuLink
            href={ROUTES.download}
            icon={<ExternalLink size={16} />}
            label="Download"
          />
          <ProfileMenuLink href={ROUTES.settings} label="Settings" />
          <button
            className="flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLogoutPending}
            onClick={() => logout()}
            type="button"
          >
            {isLogoutPending ? 'Logging out...' : 'Log out'}
          </button>

          <div className="mx-1 my-1 border-t border-white/10" />

          <div className="px-3 py-4">
            <h3 className="text-base font-bold text-text">Your Updates</h3>
            <div className="grid justify-items-center py-7 text-center">
              <Check className="mb-3 text-text" size={36} />
              <p className="font-bold text-text">You're all caught up</p>
              <p className="mt-2 max-w-60 text-xs leading-5 text-text-subdued">
                Watch this space for news on your followers, playlists, events
                and more.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

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
