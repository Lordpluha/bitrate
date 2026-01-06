import { Footer } from '@widgets/Footer'
import { Header } from '@widgets/Header'
import type { PropsWithChildren } from 'react'

export default function LandingLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
