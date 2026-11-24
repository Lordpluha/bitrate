import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { radius, spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

import { Button } from './button'
import { Icon, type IconName } from './icon'

type StateMessageProps = {
  icon: IconName
  title: string
  description?: string
  tone?: 'neutral' | 'error'
  action?: { label: string; onPress: () => void }
}

/**
 * The shared empty / error / not-found block — the design's EmptyState and ErrorState: an icon
 * disc, a title, one line of help and at most one action.
 */
export function StateMessage({ icon, title, description, tone = 'neutral', action }: StateMessageProps) {
  const { colors } = useTheme()
  const isError = tone === 'error'

  return (
    <View accessibilityRole={isError ? 'alert' : undefined} style={styles.root}>
      <View style={[styles.disc, { backgroundColor: isError ? colors.errorSurface : colors.surface }]}>
        <Icon name={icon} size={24} tone={isError ? 'errorText' : 'textSecondary'} />
      </View>
      <ThemedText style={styles.center} variant="heading">
        {title}
      </ThemedText>
      {description ? (
        <ThemedText style={styles.center} tone="textSecondary" variant="caption">
          {description}
        </ThemedText>
      ) : null}
      {action ? (
        <View style={styles.action}>
          <Button label={action.label} onPress={action.onPress} variant="secondary" />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: spacing['2'], paddingVertical: spacing['8'], paddingHorizontal: spacing['4'] },
  disc: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  center: { textAlign: 'center' },
  action: { marginTop: spacing['3'], alignSelf: 'stretch' },
})
