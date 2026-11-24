import { useRouter } from 'expo-router'
import type { BottomTabBarProps } from 'expo-router/tabs'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { radius, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'
import { usePlayerStore } from '@/lib/player/player-store'

import { IslandArtwork } from './island-artwork'
import { IslandPlayButton } from './island-play-button'
import { IslandTab } from './island-tab'
import { ISLAND_TABS, activeIslandTab } from './island-tabs'

const ISLAND_HEIGHT = 66

/**
 * The phone's navigation and player in one floating island (the design's Mobile/Island, as in the
 * web player's MobileIsland): playing artwork in a gradient ring, Home / Search / Library, play.
 * Without a track it is navigation only.
 */
export function Island({ state, navigateToTab }: BottomTabBarProps) {
  const { colors } = useTheme()
  const { t } = useI18n()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const track = usePlayerStore((player) => player.queue[player.index] ?? null)
  const active = activeIslandTab(state.routes[state.index]?.name)

  return (
    <View pointerEvents="box-none" style={[styles.slot, { paddingBottom: insets.bottom + 18 }]}>
      <View
        accessibilityRole="tablist"
        style={[styles.island, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
      >
        {track ? (
          <IslandArtwork onPress={() => router.push('/now-playing')} title={track.title} uri={track.coverUrl} />
        ) : null}
        <View style={styles.tabs}>
          {ISLAND_TABS.map((tab) => (
            <IslandTab
              active={active === tab.route}
              icon={tab.icon}
              key={tab.route}
              label={t(tab.labelKey)}
              onPress={() => {
                const route = state.routes.find((candidate) => candidate.name === tab.route)
                if (route) navigateToTab(route.key)
              }}
            />
          ))}
        </View>
        {track ? <IslandPlayButton /> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing['4'] },
  island: {
    height: ISLAND_HEIGHT,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['2'],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  tabs: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
})
