import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { radius, spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type FormAlertProps = {
  message: string
  title?: string
  tone?: 'error' | 'success'
}

/** A status callout above a form's button: the failed submit, or a confirmation. */
export function FormAlert({ message, title, tone = 'error' }: FormAlertProps) {
  const { colors } = useTheme()
  const isError = tone === 'error'

  return (
    <View
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
      style={[
        styles.box,
        {
          backgroundColor: isError ? colors.errorSurface : colors.successSurface,
          borderColor: isError ? colors.errorBorder : colors.success,
        },
      ]}
    >
      <Icon name={isError ? 'alert-circle' : 'check-circle'} size={18} tone={isError ? 'errorText' : 'successText'} />
      <View style={styles.text}>
        {title ? (
          <ThemedText tone={isError ? 'errorText' : 'successText'} variant="bodyStrong">
            {title}
          </ThemedText>
        ) : null}
        <ThemedText tone={isError ? 'errorText' : 'successText'} variant="caption">
          {message}
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: spacing['2'], padding: spacing['3'], borderRadius: radius.xl, borderWidth: 1 },
  text: { flex: 1, gap: 2 },
})
