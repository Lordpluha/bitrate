import { useState } from 'react'
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { MIN_TOUCH_TARGET, radius, spacing, typography } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'

import { Icon } from './icon'

type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string
  error?: string | null
  /** Renders a password field with a show/hide toggle. */
  secret?: boolean
}

/** A labelled input with an inline error, sized for touch. */
export function TextField({ label, error, secret = false, ...input }: TextFieldProps) {
  const { colors } = useTheme()
  const { t } = useI18n()
  const [revealed, setRevealed] = useState(false)

  return (
    <View style={styles.field}>
      <ThemedText variant="label" tone="textSecondary">
        {label}
      </ThemedText>
      <View style={[styles.box, { backgroundColor: colors.input, borderColor: error ? colors.errorBorder : colors.border }]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textSubdued}
          secureTextEntry={secret && !revealed}
          style={[typography.body, styles.input, { color: colors.text }]}
          {...input}
        />
        {secret ? (
          <Pressable
            accessibilityLabel={t(revealed ? 'auth.password.hide' : 'auth.password.show')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setRevealed((value) => !value)}
            style={styles.toggle}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} tone="textSecondary" size={18} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText accessibilityLiveRegion="polite" variant="caption" tone="errorText">
          {error}
        </ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: { gap: spacing['1_5'] },
  box: {
    minHeight: MIN_TOUCH_TARGET + 4,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
  },
  input: { flex: 1, paddingVertical: spacing['3'] },
  toggle: { padding: spacing['1'] },
})
