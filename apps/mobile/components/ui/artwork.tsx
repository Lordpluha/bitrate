import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'

import { radius as radii } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

import { Icon, type IconName } from './icon'

type ArtworkProps = {
  uri: string | null
  size: number
  /** Glyph shown when there is no image (or it fails to load). */
  fallback?: IconName
  round?: boolean
}

/** Cover art or avatar with a themed placeholder; always decorative — label its container. */
export function Artwork({ uri, size, fallback = 'music', round = false }: ArtworkProps) {
  const { colors } = useTheme()
  const shape = { width: size, height: size, borderRadius: round ? radii.full : radii.lg }

  return (
    <View accessible={false} style={[styles.frame, shape, { backgroundColor: colors.muted }]}>
      <Icon name={fallback} size={Math.max(16, size * 0.36)} tone="textSubdued" />
      {uri ? <Image contentFit="cover" source={{ uri }} style={[StyleSheet.absoluteFill, shape]} transition={150} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
})
