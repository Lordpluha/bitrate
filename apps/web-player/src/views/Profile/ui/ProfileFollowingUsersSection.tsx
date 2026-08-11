import Image from 'next/image'
import Link from 'next/link'
import type { FollowedUser } from '@/entities/User'
import { ROUTES } from '@/shared/routes'
import { getUserAvatarUrl } from '@/shared/utils/mediaUrl'
import { ProfileSection } from './ProfileSection'

type ProfileFollowingUsersSectionProps = {
  isPending: boolean
  users: FollowedUser[]
}

export const ProfileFollowingUsersSection = ({
  isPending,
  users,
}: ProfileFollowingUsersSectionProps) => (
  <ProfileSection title="Following">
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-4 sm:gap-5">
      {isPending ? (
        <p className="text-text-subdued">Loading profiles...</p>
      ) : users.length === 0 ? (
        <p className="text-text-subdued">You are not following anyone yet.</p>
      ) : (
        users.map((user) => (
          <Link
            className="block min-w-0 rounded-md p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            href={ROUTES.user(user.id)}
            key={user.id}
          >
            <Image
              alt={user.username}
              className="aspect-square w-full rounded-full object-cover shadow-xl"
              height={180}
              src={getUserAvatarUrl(user.avatar)}
              unoptimized
              width={180}
            />
            <h3 className="mt-4 truncate text-base text-text">
              {user.username}
            </h3>
            <p className="text-sm text-text-subdued">Profile</p>
          </Link>
        ))
      )}
    </div>
  </ProfileSection>
)
