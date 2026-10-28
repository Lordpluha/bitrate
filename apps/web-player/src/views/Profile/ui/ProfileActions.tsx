import { Pencil, Settings } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'

/** Your own profile's actions: Edit profile (Settings › Profile details) and Settings. */
export const ProfileActions = () => {
  const { t } = useI18n()

  return (
    <>
      <Link
        className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        href={ROUTES.settings}
      >
        <Pencil aria-hidden="true" size={15} />
        {t('profile.edit')}
      </Link>
      <Link
        aria-label={t('profile.openSettings')}
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        href={ROUTES.settings}
      >
        <Settings aria-hidden="true" size={18} />
      </Link>
    </>
  )
}
