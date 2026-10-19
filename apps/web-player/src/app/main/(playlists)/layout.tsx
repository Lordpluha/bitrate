import { CollectionPanel } from '@shared/ui/CollectionHeader'
import type { PropsWithChildren } from 'react'

export default function LikedSongsLayout({ children }: PropsWithChildren) {
  return <CollectionPanel>{children}</CollectionPanel>
}
