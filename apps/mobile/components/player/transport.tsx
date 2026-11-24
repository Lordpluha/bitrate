import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'

import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { radius, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'
import { usePlayerStore } from '@/lib/player/player-store'

const PLAY_SIZE = 72

/** Previous / play-pause / next. The play disc turns into "retry" after a playback error. */
export function Transport() {
  const { colors } = useTheme()
  const { t } = useI18n()
  const status = usePlayerStore((player) => player.status)
  const hasNext = usePlayerStore((player) => player.index < player.queue.length - 1)
  const { togglePlay, next, previous } = usePlayerStore.getState()
  const playing = status === 'playing' || status === 'buffering'
  const icon = status === 'error' ? 'rotate-cw' : playing ? 'pause' : 'play'

  return (
    <View style={styles.row}>
      <IconButton icon="skip-back" label={t('player.previous')} onPress={() => void previous()} size={28} />
      <Pressable
        accessibilityLabel={t(playing ? 'player.pause' : 'player.play')}
        accessibilityRole="button"
        accessibilityState={{ busy: status === 'loading' }}
        disabled={status === 'loading'}
        onPress={() => void togglePlay()}
        style={[styles.play, { backgroundColor: colors.foreground }]}
      >
        {status === 'loading' ? <ActivityIndicator color={colors.background} /> : <Icon name={icon} size={28} tone="background" />}
      </Pressable>
      <IconButton disabled={!hasNext} icon="skip-forward" label={t('player.next')} onPress={next} size={28} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing['8'] },
  play: { width: PLAY_SIZE, height: PLAY_SIZE, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
})
