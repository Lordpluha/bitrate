import clsx from "clsx";
import React, {FC, PropsWithChildren, HTMLAttributes } from "react";

export type GreyBlockProps = PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>


export const GreyBlock: FC<GreyBlockProps> = ({

  className,
  children,
  ...etcProps

}) => {
  return <div className={clsx(
          "rounded-3xl bg-[#121212] container-2 py-20",
          className,
        )} {...etcProps}>
          {children}
  </div>

}
