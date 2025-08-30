import { PropsWithChildren } from 'react'

import { AuthBanner } from '@shared/ui'

export default function AuthBannerLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <AuthBanner />
    </>
  )
}
