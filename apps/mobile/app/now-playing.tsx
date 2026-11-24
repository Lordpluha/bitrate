import { useRouter } from 'expo-router'
import { StyleSheet, useWindowDimensions, View } from 'react-native'

import { PlaybackStatus } from '@/components/player/playback-status'
import { SeekBar } from '@/components/player/seek-bar'
import { Transport } from '@/components/player/transport'
import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { IconButton } from '@/components/ui/icon-button'
import { Screen } from '@/components/ui/screen'
import { StateMessage } from '@/components/ui/state-message'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useEngineProgress } from '@/lib/player/engine/use-engine-progress'
import { usePlayerStore } from '@/lib/player/player-store'

const MAX_COVER = 360

/** Full-screen player (modal): artwork, title, seek bar, transport and playback problems. */
export default function NowPlayingScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const track = usePlayerStore((player) => player.queue[player.index] ?? null)
  const source = usePlayerStore((player) => player.source)
  const seekTo = usePlayerStore((player) => player.seekTo)
  const progress = useEngineProgress()
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'))

  return (
    <Screen scroll={false}>
      <View style={styles.bar}>
        <IconButton icon="chevron-down" label={t('common.close')} onPress={close} />
        <ThemedText tone="textSecondary" variant="label">
          {(source?.title ?? t('player.nowPlaying')).toUpperCase()}
        </ThemedText>
        <View style={styles.barSpacer} />
      </View>
      {track ? (
        <View style={styles.body}>
          <View style={styles.cover}>
            <Artwork size={Math.min(width - spacing['8'], MAX_COVER)} uri={track.coverUrl} />
          </View>
          <View style={styles.titles}>
            <ThemedText accessibilityRole="header" numberOfLines={2} variant="title">
              {track.title}
            </ThemedText>
            <ThemedText numberOfLines={1} tone="textSecondary">
              {track.artistName ?? source?.title ?? t('player.unknownArtist')}
            </ThemedText>
          </View>
          <SeekBar
            durationSec={progress.durationSec || track.durationSec || 0}
            onSeek={(position) => void seekTo(position)}
            positionSec={progress.positionSec}
          />
          <Transport />
          <PlaybackStatus />
        </View>
      ) : (
        <StateMessage description={t('player.idle.description')} icon="headphones" title={t('player.idle.title')} />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barSpacer: { width: 44 },
  body: { flex: 1, justifyContent: 'center', gap: spacing['6'] },
  cover: { alignItems: 'center' },
  titles: { gap: spacing['1'] },
})
