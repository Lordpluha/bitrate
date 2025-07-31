import React, {
  type PropsWithChildren,
  type HTMLAttributes,
  type FC
} from 'react'
import clsx from 'clsx'

export type Heading1Props = PropsWithChildren<
  HTMLAttributes<HTMLHeadingElement>
>

export const Heading1: FC<Heading1Props> = ({
  className,
  children,
  ...etcProps
}) => {
  return (
    <h1
      className={clsx(
        'text-[4.5rem]',
        'max-lg:text-4xl',
        'max-md:text-3xl',
        className
      )}
      {...etcProps}
    >
      {children}
    </h1>
  )
}
