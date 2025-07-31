import { Footer } from '@widgets/Footer'
import { Header } from '@widgets/Header'
import { PropsWithChildren } from 'react'

export default function LandingLayout({ children }: PropsWithChildren) {
  return (
    <div className={'flex flex-col min-h-[100vh] bg-bg text-text'}>
      <Header />
      <main>{children}</main>
      <Footer className='mt-auto' />
    </div>
  )
}
