import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

import { type ColorName, MIN_TOUCH_TARGET, radius, spacing, typography } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

import { Icon, type IconName } from './icon'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  icon?: IconName
  loading?: boolean
  disabled?: boolean
}

const PALETTE: Record<ButtonVariant, { fill: ColorName | null; text: ColorName }> = {
  primary: { fill: 'primary', text: 'primaryForeground' },
  secondary: { fill: 'secondary', text: 'secondaryForeground' },
  ghost: { fill: null, text: 'textBrand' },
  destructive: { fill: 'destructiveSurface', text: 'destructiveForeground' },
}

/** The app's one button: full-width pill, ≥44pt tall, spinner while `loading`. */
export function Button({ label, onPress, variant = 'primary', icon, loading = false, disabled = false }: ButtonProps) {
  const { colors } = useTheme()
  const { fill, text } = PALETTE[variant]
  const inactive = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: fill ? colors[fill] : 'transparent', opacity: inactive ? 0.6 : pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={colors[text]} /> : icon ? <Icon name={icon} tone={text} size={18} /> : null}
        <Text style={[typography.bodyStrong, { color: colors[text] }]}>{label}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET + 4,
    borderRadius: radius.full,
    paddingHorizontal: spacing['5'],
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing['2'] },
})
