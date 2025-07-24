import clsx from "clsx";
import React, { FC, PropsWithChildren, HTMLAttributes } from "react";

export type GreyBlockProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export const GreyBlock: FC<GreyBlockProps> = ({
  className,
  children,
  ...etcProps
}) => {
  return (
    <div
      className={clsx("container rounded-3xl bg-bgSecondary py-20", className)}
      {...etcProps}
    >
      {children}
    </div>
  );
};
