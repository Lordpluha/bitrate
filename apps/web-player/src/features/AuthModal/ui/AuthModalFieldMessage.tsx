'use client'

import { useFormField } from '@bitrate/ui-react'
import { translateMessage, useI18n } from '@shared/i18n'

/**
 * `FormMessage` for the auth modal: the shared auth schemas store catalog keys, so the message
 * is translated before it is shown. Use inside `FormItem`.
 */
export const AuthModalFieldMessage = () => {
  const { t } = useI18n()
  const { error, formMessageId } = useFormField()
  const message = error?.message ? String(error.message) : ''

  if (!message) return null

  return (
    <p className="text-sm font-medium text-red-600" id={formMessageId}>
      {translateMessage({ message, t })}
    </p>
  )
}
