import { SwitchLanguagesIcon, cn } from '@spotify/ui-react'

export const SwitchLanguagesLogo = ({ className, ...rest }: { className?: string }) => {
  return (
    <SwitchLanguagesIcon
      width={20}
      height={20}
      {...rest}
      className={cn(
        'text-text fill-text cursor-pointer',
        className
      )}
    />
  )
}
