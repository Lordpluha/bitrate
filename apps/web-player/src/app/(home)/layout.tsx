import { brandFontVariables } from '@shared/fonts'
import type { PropsWithChildren } from 'react'

export default function HomeLayout({ children }: PropsWithChildren) {
  return <div className={brandFontVariables}>{children}</div>
}
