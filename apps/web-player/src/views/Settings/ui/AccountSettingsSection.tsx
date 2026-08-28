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
        <p className="text-sm text-text-subdued">
          {t('settings.account.edit')}
        </p>
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-bold text-text transition-colors hover:border-white"
          href={ROUTES.profile}
        >
          {t('common.edit')}
          <ExternalLink size={16} />
        </Link>
      </div>
      {user ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            <p className="text-sm font-semibold text-text">Email address</p>
            <p className="text-sm text-text-subdued">{user.email}</p>
          </div>
          {user.emailVerifiedAt ? (
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
              Verified
            </span>
          ) : (
            <Link
              className="rounded-full border border-white/40 px-4 py-2 text-sm font-bold text-text hover:border-white"
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
