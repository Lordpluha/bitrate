'use client'

import { Button, GoogleIcon, LogoIcon, Typography } from '@bitrate/ui-react'
import { getOAuthUrl } from '@features/Auth/api/oauth'
import { SocialLegalConsent } from '@features/Auth/ui/SocialLegalConsent'
import { useState } from 'react'

type AuthModalHeaderProps = {
  description: string
  title: string
}

export const AuthModalHeader = ({
  description,
  title,
}: AuthModalHeaderProps) => (
  <div className="flex flex-col items-center">
    <LogoIcon aria-hidden="true" height={64} width={64} />
    <Typography
      as="h2"
      className="mt-2 text-center text-text-contrast"
      size="heading5"
    >
      {title}
    </Typography>
    <Typography as="p" className="text-center text-grey-500" size="body">
      {description}
    </Typography>
  </div>
)

type AuthModalGoogleButtonProps = {
  /**
   * Whether the form's own "I accept" checkbox is ticked. Leave it out where the modal has
   * none (sign-in): the button then brings one of its own.
   */
  accepted?: boolean
}

/** Google sign-in for the modals; locked until the Terms and Privacy Policy are accepted. */
export const AuthModalGoogleButton = ({
  accepted,
}: AuthModalGoogleButtonProps) => {
  const [ownAccepted, setOwnAccepted] = useState(false)
  const hasOwnCheckbox = accepted === undefined
  const isUnlocked = accepted ?? ownAccepted

  const content = (
    <>
      <GoogleIcon aria-hidden="true" className="mr-2" />
      <Typography as="span" className="text-text-contrast" size="body">
        Continue with Google
      </Typography>
    </>
  )

  return (
    <div className="flex flex-col gap-3">
      {hasOwnCheckbox ? (
        <SocialLegalConsent
          checked={ownAccepted}
          id="modal-social-accept-legal"
          onCheckedChange={setOwnAccepted}
        />
      ) : null}
      {isUnlocked ? (
        <Button asChild variant="contrast">
          <a href={getOAuthUrl('google', { acceptLegal: true })}>{content}</a>
        </Button>
      ) : (
        <Button disabled type="button" variant="contrast">
          {content}
        </Button>
      )}
    </div>
  )
}
