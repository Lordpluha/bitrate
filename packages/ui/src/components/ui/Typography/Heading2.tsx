import React, {
  type PropsWithChildren,
  type HTMLAttributes,
  type FC
} from 'react'
import clsx from 'clsx'

export type Heading2Props = PropsWithChildren<
  HTMLAttributes<HTMLHeadingElement>
>

export const Heading2: FC<Heading2Props> = ({
  className,
  children,
  ...etcProps
}) => {
  return (
    <h2
      className={clsx(
        'text-[2.875rem]',
        'max-lg:text-3xl',
        'max-md:text-2xl',
        className
      )}
      {...etcProps}
    >
      {children}
    </h2>
  )
}
