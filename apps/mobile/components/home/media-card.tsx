import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import type { FeedCard } from '@/lib/catalog/feed-card'

const CARD_SIZE = 148

/** A square cover with title and subtitle in a feed row; pressing it plays the card. */
export function MediaCard({ card, onPress }: { card: FeedCard; onPress: () => void }) {
  const { t } = useI18n()
  const subtitle = card.subtitle ?? ''

  return (
    <Pressable
      accessibilityLabel={`${t('player.play')}: ${card.title}${subtitle ? `, ${subtitle}` : ''}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Artwork fallback={card.kind === 'track' ? 'music' : 'disc'} size={CARD_SIZE} uri={card.imageUrl} />
      <ThemedText numberOfLines={1} variant="bodyStrong">
        {card.title}
      </ThemedText>
      {subtitle ? (
        <ThemedText numberOfLines={1} tone="textSecondary" variant="caption">
          {subtitle}
        </ThemedText>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { width: CARD_SIZE, gap: spacing['1'] },
  pressed: { opacity: 0.8 },
})
