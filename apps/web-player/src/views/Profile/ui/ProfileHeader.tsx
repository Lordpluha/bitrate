import { UserRound } from 'lucide-react'
import Image from 'next/image'

type ProfileHeaderProps = {
  avatarUrl: string | null
  description?: string | null
  username: string
}

export const ProfileHeader = ({
  avatarUrl,
  description,
  username,
}: ProfileHeaderProps) => (
  <section className="bg-gradient-to-b from-surface-hover via-surface to-background-tinted px-4 pb-7 pt-8 sm:px-6 sm:pt-10">
    <div className="flex min-w-0 items-end gap-6 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-4">
      <div className="flex h-58 w-58 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface shadow-2xl max-[900px]:h-36 max-[900px]:w-36 max-[640px]:h-28 max-[640px]:w-28">
        {avatarUrl ? (
          <Image
            alt={username}
            className="h-full w-full object-cover"
            height={232}
            src={avatarUrl}
            unoptimized
            width={232}
          />
        ) : (
          <UserRound className="text-text-subdued" size={86} />
        )}
      </div>

      <div className="min-w-0 pb-3 max-[640px]:w-full">
        <p className="text-sm text-text">Profile</p>
        <h1 className="break-words text-7xl font-black tracking-normal text-text max-[1100px]:text-5xl max-[640px]:text-4xl">
          {username}
        </h1>
        {description && (
          <p className="mt-5 max-w-150 text-sm text-text-subdued">
            {description}
          </p>
        )}
      </div>
    </div>
  </section>
)
