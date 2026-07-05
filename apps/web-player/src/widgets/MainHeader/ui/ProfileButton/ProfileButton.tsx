'use client'

import { useAuth } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { generateColor } from '@shared/utils'
import { getUserAvatarUrl } from '@shared/utils/mediaUrl'

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@spotify/ui-react'
import Image from 'next/image'
import Link from 'next/link'
import type { FC, HTMLAttributes } from 'react'

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
              <PopoverTrigger className="w-12 h-12 rounded-full hover:scale-105 transition-transform duration-200 bg-grey-900 p-2">
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
                    className="w-full h-full rounded-full flex items-center justify-center text-black font-semibold text-xl"
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
        <PopoverContent className="flex min-w-40 flex-col gap-2">
          <Link
            className="rounded-md px-3 py-2 text-sm hover:bg-white/10"
            href={ROUTES.profile}
          >
            Profile
          </Link>
          <Button disabled={isLogoutPending} onClick={() => logout()}>
            {isLogoutPending ? 'Logging out...' : 'Logout'}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
