import { cn } from '@bitrate/ui-react'
import { SwitchLanguagesLogo } from '@shared/ui'

export const SwitchLanguagesButton = ({
  className,
  ...rest
}: {
  className?: string
}) => {
  return (
    <div className={cn(className)} {...rest}>
      <SwitchLanguagesLogo className={cn(className)} />
    </div>
  )
}
