'use client'

import {
  Button,
  FacebookArtistIcon,
  GoogleIcon,
  Typography,
} from '@bitrate/ui-react'

const buttonStyles =
  'border bg-black-800 text-white border-neutral-600 relative w-full inline-flex items-center justify-center'

const iconStyles = 'absolute left-4 top-1/2 -translate-y-1/2'

const ICON_SIZE = 24

/** One social provider a visitor can sign up with. */
type SocialProvider = {
  label: string
  Icon: typeof GoogleIcon
}

const PROVIDERS: SocialProvider[] = [
  { label: 'Continue with Google', Icon: GoogleIcon },
  { label: 'Continue with Facebook', Icon: FacebookArtistIcon },
]

/** The social sign-up alternatives shown under the email field. */
export const SocialAuthButtons = () => (
  <>
    {PROVIDERS.map(({ label, Icon }) => (
      <Button
        className={buttonStyles}
        key={label}
        size="xl"
        type="button"
        variant="artistCard"
      >
        <span className={iconStyles}>
          <Icon className="block" height={ICON_SIZE} width={ICON_SIZE} />
        </span>
        <span className="w-full text-center">
          <Typography as="p" className="leading-none" size="heading6">
            {label}
          </Typography>
        </span>
      </Button>
    ))}
  </>
)
