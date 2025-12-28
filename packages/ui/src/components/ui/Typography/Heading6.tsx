import clsx from "clsx";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

export type Heading6Props = PropsWithChildren<
	HTMLAttributes<HTMLHeadingElement>
>;

export const Heading6: FC<Heading6Props> = ({
	className,
	children,
	...etcProps
}) => {
	return (
		<h6
			className={clsx(
				"text-[1.125rem]",
				"max-lg:text-base",
				"max-md:text-sm",
				className,
			)}
			{...etcProps}
		>
			{children}
		</h6>
	);
};
