import { Pressable, StyleSheet } from 'react-native'

import { type ColorName, MIN_TOUCH_TARGET, radius } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

import { Icon, type IconName } from './icon'

type IconButtonProps = {
  icon: IconName
  label: string
  onPress: () => void
  size?: number
  /** Solid disc colour; transparent when omitted. */
  fill?: ColorName
  tone?: ColorName
  disabled?: boolean
}

/** A round 44pt icon control with a required accessible label. */
export function IconButton({ icon, label, onPress, size = 22, fill, tone = 'text', disabled = false }: IconButtonProps) {
  const { colors } = useTheme()

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: fill ? colors[fill] : 'transparent', opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <Icon name={icon} size={size} tone={tone} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
