import { MediaImage } from '@shared/ui/MediaImage'
import type { ReactNode } from 'react'

type ProfileHeaderProps = {
  /** Edit profile and settings for yourself, Follow for someone else. */
  action?: ReactNode
  avatarUrl: string | null
  description?: string | null
  username: string
}

/**
 * The design's Profile Header: a 180px round avatar beside the label, a 72px name, the bio and
 * the actions. Phones show an 88px avatar beside the name with the actions underneath.
 */
export const ProfileHeader = ({
  action,
  avatarUrl,
  description,
  username,
}: ProfileHeaderProps) => (
  <section className="flex min-w-0 flex-col gap-3.5 md:py-7">
    <div className="flex min-w-0 items-center gap-4 md:items-end md:gap-7">
      <MediaImage
        alt=""
        className="size-22 shrink-0 rounded-full object-cover shadow-2xl md:size-45"
        fallback="user"
        height={180}
        priority
        src={avatarUrl}
        unoptimized
        width={180}
      />
      <div className="flex min-w-0 flex-col gap-1 md:gap-2">
        <p className="text-xs text-muted-foreground md:text-[13px] md:font-semibold md:text-foreground">
          Profile
        </p>
        <h1 className="truncate text-2xl leading-[1.25] font-semibold md:text-[72px] md:leading-none md:font-bold">
          {username}
        </h1>
        {description ? (
          <p className="line-clamp-2 max-w-150 text-[13px] text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action ? (
          <div className="hidden items-center gap-2.5 pt-1 md:flex">
            {action}
          </div>
        ) : null}
      </div>
    </div>
    {action ? (
      <div className="flex items-center gap-2.5 md:hidden">{action}</div>
    ) : null}
  </section>
)
