'use client'

import { useI18n } from '@shared/i18n'

/** "or" between the email form and social sign-in. */
export const AuthOrDivider = () => {
  const { t } = useI18n()

  return (
    <div aria-hidden="true" className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[13px] leading-[1.25] text-muted-foreground">
        {t('auth.or')}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
