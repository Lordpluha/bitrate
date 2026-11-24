import * as WebBrowser from 'expo-web-browser'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { TextLink } from '@/components/ui/text-link'
import { MIN_TOUCH_TARGET, radius, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'
import { WEB_PLAYER_URL } from '@/lib/api/config'
import type { TranslationKey } from '@/lib/i18n/messages/en'

type LegalConsentProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string | null
}

/** The documents live on the web player (`/legal/:slug`) and open in the in-app browser. */
const DOCUMENTS: readonly { slug: string; labelKey: TranslationKey }[] = [
  { slug: 'terms', labelKey: 'auth.legal.terms' },
  { slug: 'community', labelKey: 'auth.legal.guidelines' },
  { slug: 'privacy', labelKey: 'auth.legal.privacy' },
]

/** The registration consent checkbox (`acceptLegal: true`) with links to each document. */
export function LegalConsent({ checked, onChange, error }: LegalConsentProps) {
  const { colors } = useTheme()
  const { t } = useI18n()

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={() => onChange(!checked)}
        style={styles.row}
      >
        <View
          style={[
            styles.box,
            { borderColor: error ? colors.errorBorder : colors.border, backgroundColor: checked ? colors.primary : 'transparent' },
          ]}
        >
          {checked ? <Icon name="check" size={14} tone="primaryForeground" /> : null}
        </View>
        <ThemedText style={styles.label} variant="caption">
          {t('auth.legal.consent')}
        </ThemedText>
      </Pressable>
      <View style={styles.links}>
        {DOCUMENTS.map(({ slug, labelKey }) => (
          <TextLink
            key={slug}
            label={t(labelKey)}
            onPress={() => void WebBrowser.openBrowserAsync(`${WEB_PLAYER_URL}/legal/${slug}`)}
          />
        ))}
      </View>
      {error ? (
        <ThemedText accessibilityLiveRegion="polite" tone="errorText" variant="caption">
          {error}
        </ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: spacing['1'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'], minHeight: MIN_TOUCH_TARGET },
  box: { width: 22, height: 22, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1 },
  links: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing['3'], paddingLeft: 34 },
})
