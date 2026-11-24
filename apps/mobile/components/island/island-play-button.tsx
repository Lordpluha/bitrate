import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'

import { Icon } from '@/components/ui/icon'
import { radius } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'
import { usePlayerStore } from '@/lib/player/player-store'

const DISC_SIZE = 50

/** The island's play disc: foreground on background, spinner while a track loads. */
export function IslandPlayButton() {
  const { colors } = useTheme()
  const { t } = useI18n()
  const status = usePlayerStore((player) => player.status)
  const togglePlay = usePlayerStore((player) => player.togglePlay)
  const playing = status === 'playing' || status === 'buffering'
  const loading = status === 'loading'

  return (
    <Pressable
      accessibilityLabel={t(playing ? 'player.pause' : 'player.play')}
      accessibilityRole="button"
      accessibilityState={{ busy: loading }}
      disabled={loading}
      onPress={() => void togglePlay()}
      style={[styles.disc, { backgroundColor: colors.foreground }]}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Icon name={playing ? 'pause' : 'play'} size={18} tone="background" />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  disc: { width: DISC_SIZE, height: DISC_SIZE, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
})
