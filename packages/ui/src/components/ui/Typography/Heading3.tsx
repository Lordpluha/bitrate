import clsx from "clsx";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

export type Heading3Props = PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>;

export const Heading3: FC<Heading3Props> = ({ className, children, ...etcProps }) => {
  return (
    <h3
      className={clsx("text-[2.25rem]", "max-lg:text-2xl", "max-md:text-xl", className)}
      {...etcProps}
    >
      {children}
    </h3>
  );
};
