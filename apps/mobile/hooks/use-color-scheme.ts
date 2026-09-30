import { useColorScheme as useRNColorScheme } from 'react-native'

/** React Native also reports 'unspecified'; treat it like an unset scheme. */
export function useColorScheme(): 'light' | 'dark' | null {
  const colorScheme = useRNColorScheme()
  return colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : null
}
