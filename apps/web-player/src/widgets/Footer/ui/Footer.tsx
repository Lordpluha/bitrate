import { LegalFooter, Logo } from '@shared/ui'

type FooterProps = {
  className?: string
}

/** Footer of the auth and legal pages: the logo and the documents Bitrate publishes. */
export const Footer = ({ className }: FooterProps) => (
  <div className={className}>
    <div className="bg-background-secondary pt-12 pb-4">
      <div className="container">
        <LegalFooter className="border-t-0 pt-0" leading={<Logo />} />
      </div>
    </div>
  </div>
)
