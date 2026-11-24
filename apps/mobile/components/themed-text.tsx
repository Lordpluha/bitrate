import { Text, type TextProps } from 'react-native'

import { type ColorName, type TypographyVariant, typography } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export type ThemedTextProps = TextProps & {
  variant?: TypographyVariant
  /** The colour role to paint the text with; `text` by default. */
  tone?: ColorName
}

/** Text on the active theme, sized from the bridged typography scale. */
export function ThemedText({ style, variant = 'body', tone = 'text', ...rest }: ThemedTextProps) {
  const { colors } = useTheme()
  return <Text style={[typography[variant], { color: colors[tone] }, style]} {...rest} />
}
