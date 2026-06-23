'use client'

import { ArtistHeader } from '@widgets/ArtistHeader'
import { Footer } from '@widgets/Footer'
import { useSubmenuContext } from '@widgets/ArtistHeader/model/SubmenuContext'
import { cn } from '@spotify/ui-react'
import { ArtistVideo } from './ArtistVideo/ui/ArtistVideo'
import { ArtistHero } from './ArtistVideo/ui/ArtistHero'
import { ArtistFeatures } from './ArtistVideo/ui/ArtistFeatures'
import { ArtistBlog } from './ArtistVideo/ui/ArtistBlog'

const ArtistViewContent = () => {
  const { activeSubmenu, isClosing } = useSubmenuContext()
  const showBlur = Boolean(activeSubmenu && !isClosing)

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 backdrop-blur-3xl bg-white/30 z-1050',
          'transition-all duration-300 ease-out',
          showBlur
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-[1.02] pointer-events-none'
        )}
      />
    </>
  )
}

export const ArtistView = () => {
  return (
    <>
      <ArtistHeader>
        <ArtistViewContent />
      </ArtistHeader>
      <ArtistHero />
      <ArtistFeatures />
      <ArtistVideo />
      <ArtistBlog />
      <Footer />
    </>
  )
}
