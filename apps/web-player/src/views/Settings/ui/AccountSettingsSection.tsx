import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'

export const AccountSettingsSection = () => {
  const { t } = useI18n()
  const { user } = useAuth()

  return (
    <SettingsSection title={t('settings.account')}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('settings.account.edit')}
        </p>
        <Link
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-60"
          href={ROUTES.profile}
        >
          {t('common.edit')}
          <ExternalLink size={16} />
        </Link>
      </div>
      {user ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm font-semibold text-text">Email address</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {user.emailVerifiedAt ? (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
              Verified
            </span>
          ) : (
            <Link
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-60"
              href={ROUTES.auth.verifyEmail(user.email)}
            >
              Verify email
            </Link>
          )}
        </div>
      ) : null}
    </SettingsSection>
  )
}
