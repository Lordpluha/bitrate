'use client'

import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@bitrate/ui-react'
import { Ellipsis, UserMinus, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { type Friend, useRemoveFriend } from '@/entities/Friend'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { MenuItem } from '@/shared/ui'

type RemoveFriendMenuProps = {
  friend: Friend
}

/** A friend row's ellipsis menu, and the inline "Remove friend?" confirmation it opens. */
export const RemoveFriendMenu = ({ friend }: RemoveFriendMenuProps) => {
  const { t } = useI18n()
  const router = useRouter()
  const removeFriend = useRemoveFriend()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (isConfirming) {
    return (
      <>
        <Button
          className="h-8 px-3 text-[13px]"
          onClick={() => setIsConfirming(false)}
          variant="ghost"
        >
          {t('common.cancel')}
        </Button>
        <Button
          className="h-8 px-3 text-[13px]"
          disabled={removeFriend.isPending}
          onClick={() => removeFriend.mutate(friend.user.id)}
          variant="destructive"
        >
          {t('friends.removeFriend')}
        </Button>
      </>
    )
  }

  return (
    <Popover onOpenChange={setIsMenuOpen} open={isMenuOpen}>
      <PopoverTrigger
        aria-label={t('friends.moreOptions', { name: friend.user.username })}
        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      >
        <Ellipsis className="size-4.5" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn(
          Z_INDEX_CLASS.popover,
          'w-52 rounded-md border border-border bg-popover p-1 text-sm shadow-2xl',
        )}
        positionerClassName={Z_INDEX_CLASS.popover}
        sideOffset={6}
      >
        <div role="menu">
          <MenuItem
            icon={<UserRound size={17} />}
            label={t('friends.viewProfile')}
            onClick={() => router.push(ROUTES.user(friend.user.id))}
          />
          <MenuItem
            icon={<UserMinus size={17} />}
            label={t('friends.removeFriend')}
            onClick={() => {
              setIsMenuOpen(false)
              setIsConfirming(true)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
