import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { Tile } from '@/components/ui/tile'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import type { PlaylistSummary } from '@/lib/catalog/my-playlists-query'

const MAX_PLAYLISTS = 3

type QuickItem = { key: string; title: string; coverUrl: string | null; liked: boolean; onPress: () => void }

/** Two-column bento of Liked Songs and the first own playlists (the design's Quick Grid). */
export function QuickGrid({ playlists, onPlayPlaylist }: { playlists: PlaylistSummary[]; onPlayPlaylist: (playlist: PlaylistSummary) => void }) {
  const { t } = useI18n()
  const router = useRouter()
  const items: QuickItem[] = [
    { key: 'liked', title: t('library.likedSongs'), coverUrl: null, liked: true, onPress: () => router.push('/liked-songs') },
    ...playlists.slice(0, MAX_PLAYLISTS).map((playlist) => ({
      key: playlist.id,
      title: playlist.title,
      coverUrl: playlist.coverUrl,
      liked: false,
      onPress: () => onPlayPlaylist(playlist),
    })),
  ]
  const rows = Array.from({ length: Math.ceil(items.length / 2) }, (_, row) => items.slice(row * 2, row * 2 + 2))

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0]?.key} style={styles.row}>
          {row.map((item) => (
            <Tile accessibilityLabel={item.title} flex key={item.key} onPress={item.onPress}>
              <View style={styles.item}>
                <Artwork fallback={item.liked ? 'heart' : 'list'} size={40} uri={item.coverUrl} />
                <ThemedText numberOfLines={2} style={styles.title} variant="label">
                  {item.title}
                </ThemedText>
              </View>
            </Tile>
          ))}
          {row.length === 1 ? <View style={styles.spacer} /> : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { gap: spacing['2'] },
  row: { flexDirection: 'row', gap: spacing['2'] },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  title: { flex: 1 },
  spacer: { flex: 1 },
})
