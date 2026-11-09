import { PageSkeleton } from '@shared/ui'

export default function FindFriendsLoading() {
  return <PageSkeleton body="list" labelKey="friends.loading" tabs />
}
