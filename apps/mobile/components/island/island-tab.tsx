import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet } from 'react-native'

import { Icon, type IconName } from '@/components/ui/icon'
import { radius } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type IslandTabProps = {
  icon: IconName
  label: string
  active: boolean
  onPress: () => void
}

const TAB_SIZE = 52

/** One 52pt navigation disc of the island; the active one sits on a secondary fill. */
export function IslandTab({ icon, label, active, onPress }: IslandTabProps) {
  const { colors } = useTheme()

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={() => {
        if (process.env.EXPO_OS === 'ios') void Haptics.selectionAsync()
        onPress()
      }}
      style={[styles.tab, active && { backgroundColor: colors.secondary }]}
    >
      <Icon name={icon} tone={active ? 'foreground' : 'mutedForeground'} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tab: { width: TAB_SIZE, height: TAB_SIZE, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
})
