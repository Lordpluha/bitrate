import { cn, SwitchLanguagesIcon } from '@spotify/ui-react'

export const SwitchLanguagesLogo = () => {
  return (
    <SwitchLanguagesIcon
      className={cn(
        'text-text fill-text cursor-pointer',
        'transform hover:scale-110 transition duration-300 ease-in-out',
      )}
      height={20}
      width={20}
    />
  )
}
