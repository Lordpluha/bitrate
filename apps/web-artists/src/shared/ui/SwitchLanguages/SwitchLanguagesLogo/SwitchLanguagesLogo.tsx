import { cn, SwitchLanguagesIcon } from '@bitrate/ui-react'

export const SwitchLanguagesLogo = ({
  className,
  ...rest
}: {
  className?: string
}) => {
  return (
    <SwitchLanguagesIcon
      height={20}
      width={20}
      {...rest}
      className={cn('text-text fill-text cursor-pointer', className)}
    />
  )
}
