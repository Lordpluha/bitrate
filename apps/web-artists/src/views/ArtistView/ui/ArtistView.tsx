'use client'

import { ArtistHeader } from '@widgets/ArtistHeader'
import { useSubmenuContext } from '@widgets/ArtistHeader/model/SubmenuContext'
import { cn } from '@spotify/ui-react'

const ArtistViewContent = () => {
  const { activeSubmenu, isClosing } = useSubmenuContext()
  const showBlur = Boolean(activeSubmenu && !isClosing)

  return (
    <>
      <div className='relative'>
        <div className="w-[500px] h-[200vh] text-center flex items-center justify-center bg-red-500">
          <h1 className="text-4xl text-white font-bold">Artist</h1>
        </div>
      </div>

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
    <ArtistHeader>
      <ArtistViewContent />
    </ArtistHeader>
  )
}
