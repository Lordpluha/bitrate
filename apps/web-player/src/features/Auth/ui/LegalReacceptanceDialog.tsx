'use client'

import { Button, Checkbox, cn } from '@bitrate/ui-react'
import { showApiErrorToast } from '@shared/api/feedback'
import { Z_INDEX_CLASS } from '@shared/constants'
import { useAuth } from '@shared/hooks'
import { useOverlayFocus } from '@shared/hooks/useOverlayFocus'
import { useState } from 'react'
import { useAcceptLegal } from '../api/useAcceptLegal'
import { LegalConsentLabel } from './LegalConsentLabel'

const CHECKBOX_ID = 'reaccept-legal'

/** The dialog cannot be dismissed; the only ways out are accepting or signing out. */
const noop = () => undefined

/**
 * Blocks the app for a signed-in user whose recorded acceptance does not cover the current
 * legal documents: accounts that predate the records, and everyone after a new revision.
 */
export const LegalReacceptanceDialog = () => {
  const { user, logout, isLogoutPending } = useAuth()
  const acceptLegal = useAcceptLegal()
  const [accepted, setAccepted] = useState(false)
  const isOpen = Boolean(user?.legalAcceptanceRequired)
  const dialogRef = useOverlayFocus<HTMLDivElement>({
    isOpen,
    onClose: noop,
  })

  if (!isOpen) return null

  const submit = async () => {
    try {
      await acceptLegal.mutateAsync()
    } catch (error) {
      showApiErrorToast(error, 'Could not record your acceptance')
    }
  }

  return (
    <div
      className={cn(
        Z_INDEX_CLASS.modal,
        'fixed inset-0 flex items-center justify-center bg-black/80 p-4',
      )}
      ref={dialogRef}
    >
      <div
        aria-labelledby="reaccept-legal-title"
        aria-modal="true"
        className="relative w-full max-w-md rounded-lg bg-popover p-6 shadow-2xl"
        role="dialog"
      >
        <h2 className="text-xl font-bold text-text" id="reaccept-legal-title">
          Our terms have been updated
        </h2>
        <p className="mt-2 text-sm text-text-subdued">
          To keep using Bitrate, please confirm that you accept the current
          documents.
        </p>
        <div className="mt-5 flex items-start gap-3 text-sm">
          <Checkbox
            checked={accepted}
            id={CHECKBOX_ID}
            onCheckedChange={setAccepted}
          />
          <LegalConsentLabel id={CHECKBOX_ID} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            disabled={isLogoutPending}
            onClick={() => logout()}
            type="button"
            variant="ghost"
          >
            Sign out
          </Button>
          <Button
            disabled={!accepted || acceptLegal.isPending}
            onClick={submit}
            type="button"
          >
            {acceptLegal.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
