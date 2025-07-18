import clsx from "clsx";
import React, { FC, PropsWithChildren, HTMLAttributes } from "react";

type ParagraphProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export const Paragraph: FC<ParagraphProps> = ({
  className,
  children,
  ...etcProps
}) => (
  <div
    className={clsx(
      "",
      className
    )}
    {...etcProps}
  >
    {children}
  </div>
);
