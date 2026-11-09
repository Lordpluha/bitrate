import { PageSkeleton } from '@shared/ui'

export default function FriendsLoading() {
  return <PageSkeleton body="list" labelKey="friends.loading" tabs />
}
