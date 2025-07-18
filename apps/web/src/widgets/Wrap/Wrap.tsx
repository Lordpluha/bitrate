import clsx from "clsx";
import React, { FC, PropsWithChildren, HTMLAttributes } from "react";

export type WrapProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement>
>;

export const Wrap: FC<WrapProps> = ({
  className,
  children,
  ...etcProps
}) => {
  return (
    <div
      className={clsx(
        "py-16 container 3xl:!max-w-[1540px] text-center max-lg:py-12 max-md:py-8",
        className,
      )}
      {...etcProps}
    >
      {children}
    </div>
  );
};
