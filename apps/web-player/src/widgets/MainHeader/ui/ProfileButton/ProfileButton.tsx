'use client'

import { useAuth } from '@shared/hooks'
import { generateColor } from '@shared/utils'
import { getUserAvatarUrl } from '@shared/utils/mediaUrl'

import {
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@spotify/ui-react'
import Image from 'next/image'
import type { HTMLAttributes } from 'react'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { ProfileMenuContent } from './ProfileMenuContent'

interface ProfileButtonProps extends HTMLAttributes<HTMLDivElement> {
  avatar?: string | null
  username: string
}

export const ProfileButton = ({
  avatar,
  className,
  username,
  ...etcDivProps
}: ProfileButtonProps) => {
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
              <PopoverTrigger
                aria-label={`Open profile menu for ${username}`}
                className="h-12 w-12 rounded-full bg-background-highlight p-2 transition-transform duration-200 hover:scale-105"
              >
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
          className={cn(
            Z_INDEX_CLASS.popover,
            'w-82 rounded-md border border-border bg-popover p-1 text-sm text-text shadow-2xl',
          )}
          positionerClassName={Z_INDEX_CLASS.popover}
          sideOffset={8}
        >
          <ProfileMenuContent
            isLogoutPending={isLogoutPending}
            onLogout={logout}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
