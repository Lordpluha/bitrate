'use client'

import { type UserFollowKind, useUserFollows } from '@entities/User'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { getUserAvatarUrl } from '@shared/utils/mediaUrl'
import Link from 'next/link'

type ProfileFollowsSectionProps = {
  kind: UserFollowKind
  title: string
  userId: string
}

/** Followers or following of a profile; says so when the person keeps the list private. */
export const ProfileFollowsSection = ({
  kind,
  title,
  userId,
}: ProfileFollowsSectionProps) => {
  const { data, isError, isPending } = useUserFollows({ kind, userId })

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[22px] leading-[1.25] font-semibold text-foreground">
        {title}
        {data && !data.isHidden ? (
          <span className="ml-2 font-[family-name:var(--font-landing-body)] text-sm font-normal text-muted-foreground">
            {data.total}
          </span>
        ) : null}
      </h2>
      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">
          This list could not be loaded right now.
        </p>
      ) : data.isHidden ? (
        <p className="text-sm text-muted-foreground">This list is private.</p>
      ) : data.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nobody here yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-4">
          {data.data.map((person) => (
            <li className="min-w-0" key={person.id}>
              <Link
                className="flex w-20 flex-col items-center gap-1.5 rounded-md text-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={ROUTES.user(person.id)}
              >
                <span className="relative block size-16 overflow-hidden rounded-full bg-surface">
                  <MediaImage
                    alt=""
                    className="object-cover"
                    fallback="user"
                    fill
                    sizes="64px"
                    src={getUserAvatarUrl(person.avatar)}
                    unoptimized
                  />
                </span>
                <span className="w-full truncate text-xs text-muted-foreground">
                  {person.username}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
