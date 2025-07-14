import clsx from "clsx";
import React, { FC, PropsWithChildren, HTMLAttributes } from "react";

export type SimpleBLockProps = PropsWithChildren<
  HTMLAttributes<HTMLHeadingElement>
>;

export const SimpleBLock: FC<SimpleBLockProps> = ({
  className,
  children,
  ...etcProps
}) => {
  return (
    <div
      className={clsx(
        "py-16 container-2 text-center max-lg:py-12 max-md:py-8",
        className,
      )}
      {...etcProps}
    >
      {children}
    </div>
  );
};
