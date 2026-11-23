import { Spinner } from '@bitrate/ui-react'
import { ResetPasswordForm } from '@features/reset-password/ui/ResetPasswordForm'
import { useI18n } from '@shared/i18n'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <Suspense fallback={<Spinner aria-label={t('common.loadingPage')} />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}
