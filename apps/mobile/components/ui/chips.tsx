import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'

import { MIN_TOUCH_TARGET, radius, spacing, typography } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export type ChipOption<T extends string> = { value: T; label: string }

type ChipsProps<T extends string> = {
  options: readonly ChipOption<T>[]
  value: T
  onChange: (value: T) => void
  accessibilityLabel: string
}

/** A single-choice chip row that scrolls sideways when it overflows (filters, settings). */
export function Chips<T extends string>({ options, value, onChange, accessibilityLabel }: ChipsProps<T>) {
  const { colors } = useTheme()

  return (
    <ScrollView
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      contentContainerStyle={styles.row}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              { backgroundColor: selected ? colors.foreground : colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[typography.caption, { color: selected ? colors.background : colors.text }]}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { gap: spacing['2'] },
  chip: {
    minHeight: MIN_TOUCH_TARGET - 8,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing['4'],
    justifyContent: 'center',
  },
})
