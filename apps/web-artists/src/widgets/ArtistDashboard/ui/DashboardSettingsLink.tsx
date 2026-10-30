import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Settings2 } from 'lucide-react'

/** Opens the full settings page from the account dialog, which it closes on the way. */
export function DashboardSettingsLink({
  onNavigate,
}: {
  onNavigate: () => void
}) {
  const { t } = useI18n()
  return (
    <Button asChild className="w-full justify-start gap-3" variant="outline">
      <Link onClick={onNavigate} preload={false} to={ROUTES.dashboard.settings}>
        <Settings2 aria-hidden="true" className="size-5 shrink-0" />
        <span className="flex-1 text-left">{t('shell.nav.settings')}</span>
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 text-text-secondary"
        />
      </Link>
    </Button>
  )
}
