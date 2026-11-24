import type { ReactNode } from 'react'
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Screen } from '@/components/ui/screen'
import { spacing } from '@/constants/theme'

import { BrandMark } from './brand-mark'

type AuthLayoutProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

/** Shared frame of the signed-out screens: brand mark, title, the form, a footer link. */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <Screen>
        <View style={styles.head}>
          <BrandMark />
          <ThemedText accessibilityRole="header" variant="title">
            {title}
          </ThemedText>
          {description ? <ThemedText tone="textSecondary">{description}</ThemedText> : null}
        </View>
        <View style={styles.form}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </Screen>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: spacing['2'], paddingTop: spacing['10'] },
  form: { gap: spacing['4'] },
  footer: { alignItems: 'center', gap: spacing['2'] },
})
