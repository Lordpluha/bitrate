import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { type ChipOption, Chips } from '@/components/ui/chips'
import { spacing } from '@/constants/theme'

type PreferenceSectionProps<T extends string> = {
  title: string
  options: readonly ChipOption<T>[]
  value: T
  onChange: (value: T) => void
}

/** A labelled single-choice preference (theme, language) as a chip row. */
export function PreferenceSection<T extends string>({ title, options, value, onChange }: PreferenceSectionProps<T>) {
  return (
    <View style={styles.section}>
      <ThemedText tone="textSecondary" variant="label">
        {title.toUpperCase()}
      </ThemedText>
      <Chips accessibilityLabel={title} onChange={onChange} options={options} value={value} />
    </View>
  )
}

const styles = StyleSheet.create({ section: { gap: spacing['2'] } })
