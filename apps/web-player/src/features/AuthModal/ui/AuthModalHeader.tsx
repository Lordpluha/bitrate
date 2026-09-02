import { Button, GoogleIcon, LogoIcon, Typography } from '@bitrate/ui-react'
import { getOAuthUrl } from '@features/Auth/api/oauth'

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

export const AuthModalGoogleButton = () => (
  <Button asChild variant="contrast">
    <a href={getOAuthUrl('google')}>
      <GoogleIcon aria-hidden="true" className="mr-2" />
      <Typography as="span" className="text-text-contrast" size="body">
        Continue with Google
      </Typography>
    </a>
  </Button>
)
