'use client'

import { type UserFollowKind, useUserFollows } from '@entities/User'
import { ROUTES } from '@shared/routes'
import { getUserAvatarUrl } from '@shared/utils/mediaUrl'
import Image from 'next/image'
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
    <section className="px-4 pb-10 sm:px-8">
      <h2 className="mb-5 text-2xl font-bold text-text">
        {title}
        {data && !data.isHidden ? (
          <span className="ml-2 text-base font-normal text-text-subdued">
            {data.total}
          </span>
        ) : null}
      </h2>
      {isPending ? (
        <p className="text-text-subdued">Loading…</p>
      ) : isError ? (
        <p className="text-text-subdued">
          This list could not be loaded right now.
        </p>
      ) : data.isHidden ? (
        <p className="text-text-subdued">This list is private.</p>
      ) : data.data.length === 0 ? (
        <p className="text-text-subdued">Nobody here yet.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,140px),1fr))] gap-5">
          {data.data.map((person) => (
            <li className="min-w-0" key={person.id}>
              <Link
                className="block rounded-md p-3 text-center transition-colors hover:bg-surface"
                href={ROUTES.user(person.id)}
              >
                <span className="relative mx-auto mb-3 block aspect-square w-full overflow-hidden rounded-full bg-surface">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="140px"
                    src={getUserAvatarUrl(person.avatar)}
                    unoptimized
                  />
                </span>
                <span className="block truncate font-semibold text-text">
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
