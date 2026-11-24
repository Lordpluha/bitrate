import { ScrollView, StyleSheet, View } from 'react-native'

import { SectionHeader } from '@/components/ui/section-header'
import { spacing } from '@/constants/theme'
import type { FeedCard, FeedRow as FeedRowData } from '@/lib/catalog/feed-card'

import { MediaCard } from './media-card'

type FeedRowProps = {
  row: FeedRowData
  onPlay: (card: FeedCard) => void
}

/** One recommendation section: its title and a sideways-scrolling row of cards. */
export function FeedRow({ row, onPlay }: FeedRowProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={row.title} />
      <ScrollView contentContainerStyle={styles.cards} horizontal showsHorizontalScrollIndicator={false}>
        {row.cards.map((card) => (
          <MediaCard card={card} key={`${card.kind}:${card.id}`} onPress={() => onPlay(card)} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: spacing['3'] },
  cards: { gap: spacing['3'] },
})
