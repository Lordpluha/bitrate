import Link from 'next/link'

type AuthFooterLinkProps = {
  href: string
  lead: string
  link: string
}

/** "Don't have an account? Sign up" under a form. */
export const AuthFooterLink = ({ href, lead, link }: AuthFooterLinkProps) => (
  <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
    {lead}
    <Link className="font-semibold text-primary hover:opacity-80" href={href}>
      {link}
    </Link>
  </p>
)
