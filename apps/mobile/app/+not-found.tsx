import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { Screen } from '@/components/ui/screen'
import { StateMessage } from '@/components/ui/state-message'
import { useI18n } from '@/hooks/use-i18n'

/** Any unknown deep link (`bitrate://…`) lands here instead of a blank screen. */
export default function NotFoundScreen() {
  const { t } = useI18n()
  const router = useRouter()

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <StateMessage
          action={{ label: t('common.goHome'), onPress: () => router.replace('/') }}
          description={t('common.notFound.description')}
          icon="compass"
          title={t('common.notFound.title')}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center' } })
