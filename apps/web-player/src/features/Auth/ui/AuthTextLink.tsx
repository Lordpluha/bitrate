import Link from 'next/link'

type AuthTextLinkProps = {
  children: string
  href: string
}

/** "Back to login" and similar quiet links under a recovery form. */
export const AuthTextLink = ({ children, href }: AuthTextLinkProps) => (
  <Link
    className="w-fit text-[13px] leading-[1.25] font-semibold text-primary hover:opacity-80"
    href={href}
  >
    {children}
  </Link>
)
