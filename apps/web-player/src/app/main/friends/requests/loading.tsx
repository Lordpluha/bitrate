import { PageSkeleton } from '@shared/ui'

export default function FriendRequestsLoading() {
  return <PageSkeleton body="list" labelKey="friends.loadingRequests" tabs />
}
