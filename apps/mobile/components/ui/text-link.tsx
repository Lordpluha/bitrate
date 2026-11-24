import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { MIN_TOUCH_TARGET } from '@/constants/theme'

type TextLinkProps = {
  label: string
  onPress: () => void
  accessibilityRole?: 'link' | 'button'
}

/** Brand-coloured inline action ("Forgot password?", "Sign up"), padded to a 44pt target. */
export function TextLink({ label, onPress, accessibilityRole = 'link' }: TextLinkProps) {
  return (
    <Pressable accessibilityRole={accessibilityRole} hitSlop={8} onPress={onPress} style={styles.target}>
      <ThemedText tone="textBrand" variant="bodyStrong">
        {label}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({ target: { minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' } })
