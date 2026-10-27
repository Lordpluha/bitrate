'use client'

import { useAuth } from '@shared/hooks'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { Logo } from '@shared/ui'
import { ActivityPopover } from './ActivityPopover'
import { AuthButtons } from './AuthButtons'
import { HeaderSearch } from './HeaderSearch'
import { MobileMainHeader } from './MobileMainHeader'
import { NotificationsPopover } from './NotificationsPopover'
import { ProfileButton } from './ProfileButton'

export const MainHeader = () => {
  const { t } = useI18n()
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <header className="sticky left-0 right-0 top-0 z-50 h-16 shrink-0 bg-background transition-colors duration-300 xl:static xl:h-10 xl:bg-transparent">
      <div className="relative flex h-full w-full items-center justify-between px-4 sm:px-5 xl:px-1.5">
        <div className="hidden w-full items-center justify-between gap-6 xl:grid xl:grid-cols-[1fr_auto_1fr]">
          <Logo href={ROUTES.main} wordmark />

          <HeaderSearch />

          <div className="flex items-center justify-end gap-4">
            {isLoading ? (
              <div className="h-8 w-8" />
            ) : isAuthenticated && user ? (
              <>
                <NotificationsPopover />
                <ActivityPopover />
                <ProfileButton
                  avatar={user.avatar}
                  username={user.username || t('common.user')}
                />
              </>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>

        <div className="h-full w-full xl:hidden">
          <MobileMainHeader />
        </div>
      </div>
    </header>
  )
}
