'use client'

import { cn } from '@bitrate/ui-react'
import { ACCOUNT_NAV } from '@shared/routes'
import { menuItemClassName } from '@shared/ui'
import Link from 'next/link'
import { ThemeSwitcher } from '@/features/SwitchTheme'
import { useI18n } from '@/shared/i18n'
import { InstallBtn } from '../InstallBtn'

type ProfileMenuContentProps = {
  isLogoutPending: boolean
  onLogout: () => void
}

const itemClassName = cn(menuItemClassName, 'py-2.5')

/**
 * The account menu behind the avatar: the account's pages, theme and log out. Notifications
 * live behind the bell, so this menu does not preview them.
 */
export const ProfileMenuContent = ({
  isLogoutPending,
  onLogout,
}: ProfileMenuContentProps) => {
  const { t } = useI18n()

  return (
    <>
      <nav aria-label={t('common.profile')}>
        {ACCOUNT_NAV.map(({ href, icon: Icon, labelKey }) => (
          <Link className={itemClassName} href={href} key={href}>
            <Icon
              aria-hidden="true"
              className="size-4.5 shrink-0 text-muted-foreground"
            />
            {t(labelKey)}
          </Link>
        ))}
        <InstallBtn />
      </nav>
      <div className="mx-1 my-1 border-t border-border" />
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <span>{t('common.theme')}</span>
        <ThemeSwitcher />
      </div>
      <button
        className={itemClassName}
        disabled={isLogoutPending}
        onClick={onLogout}
        type="button"
      >
        {isLogoutPending ? t('common.loggingOut') : t('common.logOut')}
      </button>
    </>
  )
}
