import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'

import { ThemedText } from '@/components/themed-text'
import { radius, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'
import { formatTime } from '@/lib/player/format-time'

type SeekBarProps = {
  positionSec: number
  durationSec: number
  onSeek: (positionSec: number) => void
}

/** Screen-reader step for the adjustable control. */
const STEP_SEC = 10

/** Tap or drag to seek; an `adjustable` control (swipe up/down) for screen readers. */
export function SeekBar({ positionSec, durationSec, onSeek }: SeekBarProps) {
  const { colors } = useTheme()
  const { t } = useI18n()
  const [width, setWidth] = useState(0)
  const progress = durationSec > 0 ? Math.min(positionSec / durationSec, 1) : 0

  const seekToX = (x: number) => {
    if (width > 0 && durationSec > 0) onSeek(Math.min(Math.max(x / width, 0), 1) * durationSec)
  }
  const gesture = Gesture.Race(
    Gesture.Tap().onEnd((event) => runOnJS(seekToX)(event.x)),
    Gesture.Pan().onEnd((event) => runOnJS(seekToX)(event.x)),
  )

  return (
    <View style={styles.root}>
      <GestureDetector gesture={gesture}>
        <View
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          accessibilityLabel={t('player.seek')}
          accessibilityRole="adjustable"
          accessibilityValue={{ min: 0, max: Math.round(durationSec), now: Math.round(positionSec), text: formatTime(positionSec) }}
          accessible
          onAccessibilityAction={({ nativeEvent }) =>
            onSeek(Math.max(0, positionSec + (nativeEvent.actionName === 'increment' ? STEP_SEC : -STEP_SEC)))
          }
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
          style={styles.hit}
        >
          <View style={[styles.track, { backgroundColor: colors.progressTrack }]}>
            <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.foreground }]} />
          </View>
        </View>
      </GestureDetector>
      <View style={styles.times}>
        <ThemedText tone="textSecondary" variant="label">
          {formatTime(positionSec)}
        </ThemedText>
        <ThemedText tone="textSecondary" variant="label">
          {formatTime(durationSec)}
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: spacing['1'] },
  hit: { height: 32, justifyContent: 'center' },
  track: { height: 4, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
})
