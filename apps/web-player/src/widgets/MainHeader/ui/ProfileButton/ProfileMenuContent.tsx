'use client'

import { ROUTES } from '@shared/routes'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'

type ProfileMenuContentProps = {
  isLogoutPending: boolean
  onLogout: () => void
}

export const ProfileMenuContent = ({
  isLogoutPending,
  onLogout,
}: ProfileMenuContentProps) => {
  const { t } = useI18n()

  return (
    <>
      <nav aria-label={t('common.profile')}>
        <ProfileMenuLink href={ROUTES.profile} label={t('common.profile')} />
        <ProfileMenuLink href={ROUTES.recents} label={t('recents.title')} />
        <ProfileMenuLink href={ROUTES.settings} label={t('settings.title')} />
      </nav>
      <button
        className="flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLogoutPending}
        onClick={onLogout}
        type="button"
      >
        {isLogoutPending ? t('common.loggingOut') : t('common.logOut')}
      </button>

      <div className="mx-1 my-1 border-t border-white/10" />
      <section className="px-3 py-4">
        <h3 className="text-base font-bold text-text">
          {t('profile.updates')}
        </h3>
        <div className="grid justify-items-center py-7 text-center">
          <Check aria-hidden="true" className="mb-3 text-text" size={36} />
          <p className="font-bold text-text">{t('profile.caughtUp')}</p>
          <p className="mt-2 max-w-60 text-xs leading-5 text-text-subdued">
            {t('profile.updatesDescription')}
          </p>
        </div>
      </section>
    </>
  )
}

type ProfileMenuLinkProps = {
  href: string
  label: string
}

const ProfileMenuLink = ({ href, label }: ProfileMenuLinkProps) => (
  <Link
    className="flex items-center justify-between rounded-sm px-3 py-2.5 transition-colors hover:bg-white/10"
    href={href}
  >
    {label}
  </Link>
)
