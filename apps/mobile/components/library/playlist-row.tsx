import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { Icon } from '@/components/ui/icon'
import { MIN_TOUCH_TARGET, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'

type PlaylistRowProps = {
  title: string
  coverUrl: string | null
  onPress: () => void
  /** Liked Songs uses the heart placeholder and a chevron (it opens a screen). */
  liked?: boolean
}

/** A library entry: cover and title; playlists play, Liked Songs opens its list. */
export function PlaylistRow({ title, coverUrl, onPress, liked = false }: PlaylistRowProps) {
  const { t } = useI18n()

  return (
    <Pressable
      accessibilityLabel={liked ? title : `${t('player.play')}: ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.row}
    >
      <Artwork fallback={liked ? 'heart' : 'list'} size={56} uri={coverUrl} />
      <ThemedText numberOfLines={1} style={styles.title} variant="bodyStrong">
        {title}
      </ThemedText>
      <Icon name={liked ? 'chevron-right' : 'play'} size={18} tone="textSecondary" />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { minHeight: MIN_TOUCH_TARGET + 16, flexDirection: 'row', alignItems: 'center', gap: spacing['3'] },
  title: { flex: 1 },
})
