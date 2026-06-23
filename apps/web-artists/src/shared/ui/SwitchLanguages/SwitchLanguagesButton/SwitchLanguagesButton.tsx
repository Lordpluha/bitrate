import { SwitchLanguagesLogo } from '@shared/ui'
import { cn } from '@spotify/ui-react'

export const SwitchLanguagesButton = ({ className, ...rest }: { className?: string }) => {
  return (
    <div className={cn(className)} {...rest}>
      <SwitchLanguagesLogo className={cn(className)}/>
    </div>
  )
}
