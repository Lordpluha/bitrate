import clsx from "clsx";
import React, { FC, PropsWithChildren, HTMLAttributes } from "react";

type ParagraphProps = PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>;

export const Paragraph: FC<ParagraphProps> = ({
  className,
  children,
  ...etcProps
}) => (
  <p
    className={clsx(
      "",
      className
    )}
    {...etcProps}
  >
    {children}
  </div>
);
