import clsx from "clsx";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

export type Heading5Props = PropsWithChildren<
	HTMLAttributes<HTMLHeadingElement>
>;

export const Heading5: FC<Heading5Props> = ({
	className,
	children,
	...etcProps
}) => {
	return (
		<h5
			className={clsx(
				"text-[1.5rem]",
				"max-lg:text-lg",
				"max-md:text-base",
				className,
			)}
			{...etcProps}
		>
			{children}
		</h5>
	);
};
