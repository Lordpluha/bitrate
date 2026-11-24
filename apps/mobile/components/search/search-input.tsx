import { Pressable, StyleSheet, TextInput, View } from 'react-native'

import { Icon } from '@/components/ui/icon'
import { MIN_TOUCH_TARGET, radius, spacing, typography } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
}

/** The search box: magnifier, the query, and a clear button once there is text. */
export function SearchInput({ value, onChange }: SearchInputProps) {
  const { colors } = useTheme()
  const { t } = useI18n()

  return (
    <View style={[styles.box, { backgroundColor: colors.input, borderColor: colors.border }]}>
      <Icon name="search" size={18} tone="textSecondary" />
      <TextInput
        accessibilityLabel={t('nav.search')}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        onChangeText={onChange}
        placeholder={t('search.placeholder')}
        placeholderTextColor={colors.textSubdued}
        returnKeyType="search"
        style={[typography.body, styles.input, { color: colors.text }]}
        value={value}
      />
      {value ? (
        <Pressable accessibilityLabel={t('common.close')} accessibilityRole="button" hitSlop={8} onPress={() => onChange('')}>
          <Icon name="x" size={18} tone="textSecondary" />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    minHeight: MIN_TOUCH_TARGET + 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
  },
  input: { flex: 1, paddingVertical: spacing['3'] },
})
