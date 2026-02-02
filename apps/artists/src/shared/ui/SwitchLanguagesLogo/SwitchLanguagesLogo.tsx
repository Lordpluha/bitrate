import { SwitchLanguagesIcon, cn } from '@spotify/ui-react'

export const SwitchLanguagesLogo = () => {
  return (
      <SwitchLanguagesIcon
        width={20}
        height={20}
        className={cn(
          'text-text fill-text cursor-pointer',
          'transform hover:scale-110 transition duration-300 ease-in-out'
        )}
      />
  )
}
