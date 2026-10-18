import { MediaImage } from '@shared/ui/MediaImage'
import Link from 'next/link'
import type { FollowedUser } from '@/entities/User'
import { ROUTES } from '@/shared/routes'
import { getUserAvatarUrl } from '@/shared/utils/mediaUrl'
import { ProfileSection } from './ProfileSection'

type ProfileFollowingUsersSectionProps = {
  isPending: boolean
  users: FollowedUser[]
}

/** The design's Following tile: 64px avatars with each person's name under them. */
export const ProfileFollowingUsersSection = ({
  isPending,
  users,
}: ProfileFollowingUsersSectionProps) => (
  <ProfileSection title="Following">
    {isPending ? (
      <p className="text-sm text-muted-foreground">Loading profiles...</p>
    ) : users.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        You are not following anyone yet.
      </p>
    ) : (
      <ul className="flex flex-wrap gap-3">
        {users.map((user) => (
          <li key={user.id}>
            <Link
              className="flex w-16 flex-col items-center gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={ROUTES.user(user.id)}
            >
              <MediaImage
                alt=""
                className="size-16 rounded-full object-cover"
                fallback="user"
                height={64}
                src={getUserAvatarUrl(user.avatar)}
                unoptimized
                width={64}
              />
              <span className="w-full truncate text-center text-xs text-muted-foreground">
                {user.username}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </ProfileSection>
)
