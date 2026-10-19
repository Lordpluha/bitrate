import {
  CollectionPanel,
  CollectionSkeleton,
} from '@shared/ui/CollectionHeader'

export default function Loading() {
  return (
    <CollectionPanel>
      <CollectionSkeleton label="Loading album" />
    </CollectionPanel>
  )
}
