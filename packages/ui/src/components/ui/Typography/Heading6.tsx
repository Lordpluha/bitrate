import React, {
  type PropsWithChildren,
  type HTMLAttributes,
  type FC
} from 'react'
import clsx from 'clsx'

export type Heading6Props = PropsWithChildren<
  HTMLAttributes<HTMLHeadingElement>
>

export const Heading6: FC<Heading6Props> = ({
  className,
  children,
  ...etcProps
}) => {
  return (
    <h5
      className={clsx(
        'text-[1.125rem]',
        'max-lg:text-base',
        ' max-md:text-sm',
        className
      )}
      {...etcProps}
    >
      {children}
    </h5>
  )
}

