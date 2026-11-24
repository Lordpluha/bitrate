import { useEffect } from 'react'
import type { DimensionValue } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { radius as radii } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type SkeletonProps = {
  width?: DimensionValue
  height: number
  radius?: number
}

const PULSE_MS = 900

/** A loading placeholder that pulses gently — or stays still when reduced motion is on. */
export function Skeleton({ width = '100%', height, radius = radii.lg }: SkeletonProps) {
  const { colors } = useTheme()
  const reducedMotion = useReducedMotion()
  const opacity = useSharedValue(1)

  useEffect(() => {
    if (reducedMotion) return
    opacity.value = withRepeat(withTiming(0.45, { duration: PULSE_MS }), -1, true)
  }, [opacity, reducedMotion])

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      accessible={false}
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.muted }, pulse]}
    />
  )
}
