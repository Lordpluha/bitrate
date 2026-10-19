import { Checkbox } from '@bitrate/ui-react'
import { LegalConsentLabel } from './LegalConsentLabel'

type SocialLegalConsentProps = {
  checked: boolean
  id: string
  onCheckedChange: (checked: boolean) => void
}

/**
 * The checkbox that unlocks the social sign-in buttons where no form checkbox exists.
 * Continuing with a provider creates an account for a new user, so it must be ticked first.
 */
export const SocialLegalConsent = ({
  checked,
  id,
  onCheckedChange,
}: SocialLegalConsentProps) => (
  <div className="flex items-start gap-2.5">
    <Checkbox
      checked={checked}
      className="mt-0.5 size-4 rounded border-input bg-transparent"
      id={id}
      onCheckedChange={onCheckedChange}
    />
    <LegalConsentLabel id={id} />
  </div>
)
