import clsx from "clsx";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

export type Heading4Props = PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>;

export const Heading4: FC<Heading4Props> = ({ className, children, ...etcProps }) => {
  return (
    <h4
      className={clsx("text-[1.875rem]", "max-lg:text-xl", "max-md:text-lg", className)}
      {...etcProps}
    >
      {children}
    </h4>
  );
};
