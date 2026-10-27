'use client'

import { cn } from '@bitrate/ui-react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { ThemeSwitcher } from '@/features/SwitchTheme'
import { useOverlayFocus } from '@/shared/hooks/useOverlayFocus'
import { useI18n } from '@/shared/i18n'
import { MOBILE_MENU_NAV } from '@/shared/routes'
import { AuthButtons } from '../AuthButtons'
import { InstallBtn } from '../InstallBtn'

type BurgerMenuPanelProps = {
  id: string
  isAuthenticated: boolean
  isLogoutPending: boolean
  isOpen: boolean
  logout: () => void
  onClose: () => void
  username?: string
}

export const BurgerMenuPanel = ({
  id,
  isAuthenticated,
  isLogoutPending,
  isOpen,
  logout,
  onClose,
  username,
}: BurgerMenuPanelProps) => {
  const { t } = useI18n()
  const panelRef = useOverlayFocus<HTMLDivElement>({ isOpen, onClose })

  return (
    <div
      aria-hidden={!isOpen}
      aria-label={t('nav.main')}
      aria-modal={isOpen}
      className={cn(
        'fixed right-0 top-0 z-50 h-dvh w-full max-w-96 transform border-l border-border bg-background-secondary transition-[transform,visibility] duration-300 ease-in-out',
        isOpen
          ? 'visible translate-x-0'
          : 'invisible pointer-events-none translate-x-full',
      )}
      id={id}
      inert={!isOpen}
      ref={panelRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="h-full overflow-y-auto p-6 custom-scrollbar">
        <div className="mb-8 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              {t('common.menu')}
            </h2>
            {username && (
              <p className="truncate text-sm text-muted-foreground">
                {username}
              </p>
            )}
          </div>
          <button
            aria-label={t('common.closeMenu')}
            className="p-2 text-foreground transition-opacity hover:opacity-70"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="space-y-6">
          {isAuthenticated ? (
            <>
              <nav className="grid border-b border-border pb-6">
                {MOBILE_MENU_NAV.map(({ href, icon: Icon, labelKey }) => (
                  <Link
                    className="flex items-center gap-3 rounded px-3 py-3 text-foreground transition-colors hover:bg-surface"
                    href={href}
                    key={href}
                    onClick={onClose}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4.5 shrink-0 text-muted-foreground"
                    />
                    {t(labelKey)}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center justify-between border-b border-border pb-6">
                <span className="text-sm text-muted-foreground">
                  {t('common.theme')}
                </span>
                <ThemeSwitcher />
              </div>
              <InstallBtn />
              <button
                className="w-full rounded-full bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover disabled:opacity-60"
                disabled={isLogoutPending}
                onClick={logout}
                type="button"
              >
                {isLogoutPending ? t('common.loggingOut') : t('common.logOut')}
              </button>
            </>
          ) : (
            <>
              <div className="border-b border-border pb-6">
                <InstallBtn />
              </div>
              <AuthButtons />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
