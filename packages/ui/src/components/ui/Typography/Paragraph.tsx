import type { FC, HTMLAttributes, PropsWithChildren } from "react";

type ParagraphProps = PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>;

export const Paragraph: FC<ParagraphProps> = ({ children, ...etcProps }) => (
  <p {...etcProps}>{children}</p>
);
